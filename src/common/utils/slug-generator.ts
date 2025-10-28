import * as slug from 'slug';

export class SlugGenerator {
  static generate(text: string): string {
    return slug(text, { lower: true, strict: true });
  }

  static generateWithTimestamp(text: string): string {
    const baseSlug = this.generate(text);
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
  }

  static generateUnique(text: string, existingSlugs: string[]): string {
    let baseSlug = this.generate(text);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}