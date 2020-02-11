export class TweekFetchError extends Error {
  responseText: string;
  status: number;
  url: string;

  constructor(status: number, url: string, responseText: string = '') {
    super('Tweek fetch error');
    this.responseText = responseText;
    this.status = status;
    this.url = url;
  }
}
