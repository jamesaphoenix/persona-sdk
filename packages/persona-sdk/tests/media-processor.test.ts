/**
 * Tests for media processor functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaProcessor, MediaContent, SUPPORTED_MEDIA_TYPES } from '../src/media/media-processor';
import { HumanMessage } from '@langchain/core/messages';

// Mock dependencies
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({
      content: 'Mock analysis response'
    })
  }))
}));

vi.mock('tiktoken', () => ({
  encoding_for_model: vi.fn().mockReturnValue({
    encode: vi.fn().mockImplementation((text: string) => 
      // Simple mock: ~4 chars per token
      Array(Math.ceil(text.length / 4))
    )
  })
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from('test file content'))
}));

// Mock fetch for URL processing
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  headers: {
    get: vi.fn().mockReturnValue('text/plain')
  },
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(17))
}) as any;

describe('MediaProcessor', () => {
  let processor: MediaProcessor;

  beforeEach(() => {
    processor = new MediaProcessor('test-api-key');
  });

  describe('Token counting', () => {
    it('should count tokens in text', () => {
      const text = 'This is a test string for token counting';
      const tokenCount = processor.countTokens(text);
      
      // With our mock, should be ~10 tokens
      expect(tokenCount).toBeGreaterThan(0);
      expect(tokenCount).toBeLessThan(text.length);
    });
  });

  describe('File processing', () => {
    it('should process local text file', async () => {
      const result = await processor.processFile('./test.txt');
      
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('text/plain');
      expect(result.content).toBe('test file content');
      expect(result.metadata?.encoding).toBe('utf-8');
    });

    it('should process image file as base64', async () => {
      const result = await processor.processFile('./test.jpg');
      
      expect(result.type).toBe('image');
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.metadata?.encoding).toBe('base64');
    });

    it('should process URL', async () => {
      const result = await processor.processFile('https://example.com/file.txt');
      
      expect(result.url).toBe('https://example.com/file.txt');
      expect(result.type).toBe('text');
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/file.txt');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(processor.processFile('https://example.com/404.txt'))
        .rejects.toThrow('Failed to fetch');
    });
  });

  describe('Media to messages conversion', () => {
    it('should convert text content to messages', async () => {
      const media: MediaContent = {
        type: 'text',
        mimeType: 'text/plain',
        content: 'Hello world'
      };

      const messages = await processor.mediaToMessages(media);
      
      expect(messages).toHaveLength(1);
      expect(messages[0]).toBeInstanceOf(HumanMessage);
      expect(messages[0].content).toBe('Hello world');
    });

    it('should convert image content to messages with prompt', async () => {
      const media: MediaContent = {
        type: 'image',
        mimeType: 'image/jpeg',
        content: 'base64data'
      };

      const messages = await processor.mediaToMessages(media, 'Describe this image');
      
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toHaveLength(2);
      expect(messages[0].content[0]).toHaveProperty('text', 'Describe this image');
      expect(messages[0].content[1]).toHaveProperty('image_url');
    });

    it('should handle unsupported media types', async () => {
      const media: MediaContent = {
        type: 'video',
        mimeType: 'video/mp4',
        content: 'videodata'
      };

      const messages = await processor.mediaToMessages(media);
      
      expect(messages[0].content).toContain('[VIDEO FILE: video/mp4]');
    });
  });

  describe('Media analysis for personas', () => {
    it('should analyze media and return processing result', async () => {
      const media: MediaContent = {
        type: 'text',
        mimeType: 'text/plain',
        content: 'Test content for analysis'
      };

      const result = await processor.analyzeMediaForPersona(media);
      
      expect(result.messages).toHaveLength(2); // Input + response
      expect(result.analysis).toBe('Mock analysis response');
      expect(result.usage).toBeDefined();
      expect(result.usage.input_tokens).toBeGreaterThan(0);
      expect(result.usage.output_tokens).toBeGreaterThan(0);
      expect(result.usage.total_tokens).toBe(
        result.usage.input_tokens + result.usage.output_tokens
      );
    });

    it('should use custom analysis prompt', async () => {
      const media: MediaContent = {
        type: 'text',
        mimeType: 'text/plain',
        content: 'Test content'
      };

      const customPrompt = 'Extract only age and occupation';
      const result = await processor.analyzeMediaForPersona(media, customPrompt);
      
      const messages = await processor.mediaToMessages(media, customPrompt);
      expect(result.messages[0]).toEqual(messages[0]);
    });
  });

  describe('Text post processing', () => {
    it('should process text post with persona insights', async () => {
      const text = 'Just finished my morning yoga session! Feeling centered and ready for the day.';
      const result = await processor.processTextPost(text);
      
      expect(result.messages).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.usage).toBeDefined();
    });
  });

  describe('Batch processing', () => {
    it('should process multiple media files', async () => {
      const files = ['./file1.txt', './file2.jpg', './file3.pdf'];
      const { results, totalUsage } = await processor.processMediaBatch(files);
      
      expect(results).toHaveLength(3);
      expect(totalUsage.total_tokens).toBeGreaterThan(0);
    });

    it('should handle errors in batch processing', async () => {
      vi.mocked(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const files = ['https://fail.com/file.txt', './file2.txt'];
      const { results, totalUsage } = await processor.processMediaBatch(files);
      
      // Should continue processing despite one failure
      expect(results.length).toBeLessThanOrEqual(files.length);
      expect(totalUsage).toBeDefined();
    });
  });

  describe('Cost estimation', () => {
    it('should estimate costs for different models', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        total_tokens: 1500
      };

      const gpt4Cost = processor.estimateCost(usage, 'gpt-4');
      expect(gpt4Cost.inputCost).toBeCloseTo(0.03, 2);
      expect(gpt4Cost.outputCost).toBeCloseTo(0.03, 2);
      expect(gpt4Cost.totalCost).toBeCloseTo(0.06, 2);

      const gpt35Cost = processor.estimateCost(usage, 'gpt-3.5-turbo');
      expect(gpt35Cost.totalCost).toBeLessThan(gpt4Cost.totalCost);
    });

    it('should handle unknown models with default pricing', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        total_tokens: 1500
      };

      const cost = processor.estimateCost(usage, 'unknown-model');
      expect(cost.totalCost).toBeGreaterThan(0);
    });
  });

  describe('Supported media types', () => {
    it('should have correct media type categories', () => {
      expect(SUPPORTED_MEDIA_TYPES.IMAGE).toContain('image/jpeg');
      expect(SUPPORTED_MEDIA_TYPES.IMAGE).toContain('image/png');
      expect(SUPPORTED_MEDIA_TYPES.TEXT).toContain('text/plain');
      expect(SUPPORTED_MEDIA_TYPES.DOCUMENT).toContain('application/pdf');
      expect(SUPPORTED_MEDIA_TYPES.AUDIO).toContain('audio/mpeg');
      expect(SUPPORTED_MEDIA_TYPES.VIDEO).toContain('video/mp4');
    });
  });
});