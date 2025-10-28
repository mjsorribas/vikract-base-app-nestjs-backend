export class SeoGenerator {
  static generateJsonLd(data: {
    title: string;
    description?: string;
    url?: string;
    image?: string;
    author?: string;
    datePublished?: Date;
    dateModified?: Date;
    type?: 'Article' | 'BlogPosting' | 'WebPage';
  }): object {
    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': data.type || 'Article',
      headline: data.title,
    };

    if (data.description) {
      jsonLd.description = data.description;
    }

    if (data.url) {
      jsonLd.url = data.url;
    }

    if (data.image) {
      jsonLd.image = data.image;
    }

    if (data.author) {
      jsonLd.author = {
        '@type': 'Person',
        name: data.author,
      };
    }

    if (data.datePublished) {
      jsonLd.datePublished = data.datePublished.toISOString();
    }

    if (data.dateModified) {
      jsonLd.dateModified = data.dateModified.toISOString();
    }

    return jsonLd;
  }

  static generateTitle(title: string, siteName?: string): string {
    if (siteName) {
      return `${title} | ${siteName}`;
    }
    return title;
  }

  static generateDescription(content: string, maxLength = 160): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Truncate at word boundary
    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }
}