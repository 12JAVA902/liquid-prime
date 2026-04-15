interface YouTubeSearchResult {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  viewCount: string;
  publishedAt: string;
}

interface DownloadProgress {
  trackId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

class YouTubeService {
  private API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private BASE_URL = 'https://www.googleapis.com/youtube/v3';

  async searchMusic(query: string, maxResults: number = 50): Promise<YouTubeSearchResult[]> {
    try {
      const searchResponse = await fetch(
        `${this.BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&videoCategoryId=10&key=${this.API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error('YouTube API search failed');
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Get video details including duration
      const detailsResponse = await fetch(
        `${this.BASE_URL}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.API_KEY}`
      );

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const detailsData = await detailsResponse.json();

      return searchData.items.map((item: any, index: number) => {
        const details = detailsData.items[index];
        const duration = this.formatDuration(details.contentDetails.duration);
        const viewCount = this.formatViewCount(details.statistics.viewCount);

        // Extract artist from title (common format: "Song Title - Artist Name")
        const titleParts = item.snippet.title.split(' - ');
        const title = titleParts[0] || item.snippet.title;
        const artist = titleParts[1] || item.snippet.channelTitle;

        return {
          id: `youtube-${item.id.videoId}`,
          title: title.trim(),
          artist: artist.trim(),
          duration,
          thumbnail: item.snippet.thumbnails.high.url,
          youtubeId: item.id.videoId,
          viewCount,
          publishedAt: item.snippet.publishedAt
        };
      });
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  async getTrendingMusic(region: string = 'US', maxResults: number = 50): Promise<YouTubeSearchResult[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&videoCategoryId=10&regionCode=${region}&maxResults=${maxResults}&key=${this.API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trending music');
      }

      const data = await response.json();

      return data.items.map((item: any) => {
        const duration = this.formatDuration(item.contentDetails.duration);
        const viewCount = this.formatViewCount(item.statistics.viewCount);

        // Extract artist from title
        const titleParts = item.snippet.title.split(' - ');
        const title = titleParts[0] || item.snippet.title;
        const artist = titleParts[1] || item.snippet.channelTitle;

        return {
          id: `youtube-${item.id}`,
          title: title.trim(),
          artist: artist.trim(),
          duration,
          thumbnail: item.snippet.thumbnails.high.url,
          youtubeId: item.id,
          viewCount,
          publishedAt: item.snippet.publishedAt
        };
      });
    } catch (error) {
      console.error('Trending music error:', error);
      return [];
    }
  }

  async downloadVideo(videoId: string, title: string, onProgress?: (progress: number) => void): Promise<Blob> {
    try {
      // Use a Supabase function as a proxy to download YouTube audio
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ videoId, title })
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentLength = response.headers.get('Content-Length');
      let loaded = 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress && contentLength) {
          const progress = (loaded / parseInt(contentLength)) * 100;
          onProgress(Math.round(progress));
        }
      }

      return new Blob(chunks, { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeSearchResult, DownloadProgress };
