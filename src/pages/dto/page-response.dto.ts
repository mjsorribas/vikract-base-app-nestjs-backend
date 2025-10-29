import { PageStatus, Page } from '../entities/page.entity';

export class PageResponseDto {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  slug: string;
  status: PageStatus;
  
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoJsonLd?: string;
  
  // Menu Options
  showInHomeMenu: boolean;
  showInFooterMenu: boolean;
  menuOrder: number;
  
  // Media
  mainImage?: string;
  mainVideo?: string;
  
  // Publishing Options
  publishedAt?: Date;
  scheduledAt?: Date;
  
  // Hierarchical Structure
  parentId?: string;
  parent?: PageResponseDto;
  children?: PageResponseDto[];
  
  // Author info (basic)
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Metadata
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isPublished: boolean;
  isScheduled: boolean;
  hasChildren: boolean;
  breadcrumb: string[];

  constructor(page: Page) {
    this.id = page.id;
    this.title = page.title;
    this.subtitle = page.subtitle;
    this.content = page.content;
    this.slug = page.slug;
    this.status = page.status;
    
    this.seoTitle = page.seoTitle;
    this.seoDescription = page.seoDescription;
    this.seoKeywords = page.seoKeywords;
    this.seoJsonLd = page.seoJsonLd;
    
    this.showInHomeMenu = page.showInHomeMenu;
    this.showInFooterMenu = page.showInFooterMenu;
    this.menuOrder = page.menuOrder;
    
    this.mainImage = page.mainImage;
    this.mainVideo = page.mainVideo;
    
    this.publishedAt = page.publishedAt;
    this.scheduledAt = page.scheduledAt;
    
    this.parentId = page.parentId;
    this.parent = page.parent ? new PageResponseDto(page.parent) : undefined;
    this.children = page.children?.map((child) => new PageResponseDto(child));
    
    this.authorId = page.authorId;
    this.author = page.author
      ? {
          id: page.author.id,
          firstName: page.author.firstName,
          lastName: page.author.lastName,
          email: page.author.email,
        }
      : undefined;
    
    this.viewCount = page.viewCount;
    this.isActive = page.isActive;
    this.createdAt = page.createdAt;
    this.updatedAt = page.updatedAt;
    
    this.isPublished = page.status === PageStatus.PUBLISHED;
    this.isScheduled = page.status === PageStatus.SCHEDULED;
    this.hasChildren = (page.children?.length || 0) > 0;
    this.breadcrumb = this.buildBreadcrumb(page);
  }

  private buildBreadcrumb(page: Page): string[] {
    const breadcrumb: string[] = [];
    let current = page;
    
    while (current.parent) {
      breadcrumb.unshift(current.parent.title);
      current = current.parent;
    }
    
    breadcrumb.push(page.title);
    return breadcrumb;
  }
}

export class PublicPageResponseDto {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  slug: string;
  
  // SEO Fields (public)
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoJsonLd?: string;
  
  // Media
  mainImage?: string;
  mainVideo?: string;
  
  // Hierarchical Structure (public)
  parentId?: string;
  parent?: PublicPageResponseDto;
  children?: PublicPageResponseDto[];
  
  // Author info (minimal)
  author?: {
    firstName: string;
    lastName: string;
  };
  
  // Public metadata
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  hasChildren: boolean;
  breadcrumb: string[];

  constructor(page: Page) {
    this.id = page.id;
    this.title = page.title;
    this.subtitle = page.subtitle;
    this.content = page.content;
    this.slug = page.slug;
    
    this.seoTitle = page.seoTitle;
    this.seoDescription = page.seoDescription;
    this.seoKeywords = page.seoKeywords;
    this.seoJsonLd = page.seoJsonLd;
    
    this.mainImage = page.mainImage;
    this.mainVideo = page.mainVideo;
    
    this.parentId = page.parentId;
    this.parent = page.parent
      ? new PublicPageResponseDto(page.parent)
      : undefined;
    this.children = page.children?.map(
      (child) => new PublicPageResponseDto(child),
    );
    
    this.author = page.author
      ? {
          firstName: page.author.firstName,
          lastName: page.author.lastName,
        }
      : undefined;
    
    this.viewCount = page.viewCount;
    this.publishedAt = page.publishedAt;
    this.createdAt = page.createdAt;
    this.updatedAt = page.updatedAt;
    
    this.hasChildren = (page.children?.length || 0) > 0;
    this.breadcrumb = this.buildBreadcrumb(page);
  }

  private buildBreadcrumb(page: Page): string[] {
    const breadcrumb: string[] = [];
    let current = page;
    
    while (current.parent) {
      breadcrumb.unshift(current.parent.title);
      current = current.parent;
    }
    
    breadcrumb.push(page.title);
    return breadcrumb;
  }
}

export class PageMenuDto {
  id: string;
  title: string;
  slug: string;
  menuOrder: number;
  parentId?: string;
  children?: PageMenuDto[];
}
