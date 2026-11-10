export class ConversionCancelledError extends Error {
  constructor() {
    super('Conversion cancelled');
    this.name = 'ConversionCancelledError';
  }
}