/**
 * Holds song information
 */
export class Song {
  /**
   * Creates new song
   * @param {string} title - Song title
   * @param {string} url - Song url
   * @param {string} thumbnailUrl - Song thumbnail url
   * @param {number} lengthMinutes - How many minutes in the song
   * @param {number} lengthSeconds - How many seconds left after minutes
   */
  constructor(title: string, url: string, thumbnailUrl: string) {
    this.title = title;
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.lengthMinutes = 0;
    this.lengthSeconds = 0;
  }

  title: string;
  url: string;
  thumbnailUrl: string;
  lengthMinutes: number;
  lengthSeconds: number;

  /**
   * Sets the songs lengthMinutes and lengthSeconds based on a songs length in seconds
   * @param {number} duration - Song duration in seconds
   * @return {void}
   */
  setDuration(duration: number): void {
    const seconds = duration;
    this.lengthMinutes = (seconds / 60) >> 0;
    this.lengthSeconds = seconds % 60;
    return;
  }
}
