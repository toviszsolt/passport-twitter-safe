export default class Strategy {
  authenticate(req, options) {
    throw new Error('Strategy#authenticate must be overridden by subclass');
  }
}
