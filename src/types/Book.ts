export interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    publishedYear: string;
    previewLink: string;

    // Original Fields (kept for compatibility during migration, can be optional)
    isbn?: string;
    publisher?: string;
    pageCount?: number;
    subjects?: string[];
    relevanceScore?: number; // Kept for generic sorting if needed

    // Source Tracking
    source?: 'nyt' | 'google';
    googleBooksId?: string;

    // NYT Specific Fields
    rank?: number;
    rankLastWeek?: number;
    weeksOnList?: number;
    amazonUrl?: string;
    buyLinks?: Array<{
        name: string;
        url: string;
    }>;
}

// NYT API Response Types
export interface NYTBookResult {
    rank: number;
    rank_last_week: number;
    weeks_on_list: number;
    asterisk: number;
    dagger: number;
    primary_isbn10: string;
    primary_isbn13: string;
    publisher: string;
    description: string;
    price: string;
    title: string;
    author: string;
    contributor: string;
    contributor_note: string;
    book_image: string;
    book_image_width: number;
    book_image_height: number;
    amazon_product_url: string;
    age_group: string;
    book_review_link: string;
    first_chapter_link: string;
    sunday_review_link: string;
    article_chapter_link: string;
    isbns: Array<{
        isbn10: string;
        isbn13: string;
    }>;
    buy_links: Array<{
        name: string;
        url: string;
    }>;
    book_uri: string;
}

export interface NYTListResponse {
    status: string;
    copyright: string;
    num_results: number;
    last_modified: string;
    results: {
        list_name: string;
        list_name_encoded: string;
        bestsellers_date: string;
        published_date: string;
        display_name: string;
        normal_list_ends_at: number;
        updated: string;
        books: NYTBookResult[];
    };
}

export interface NYTOverviewResponse {
    status: string;
    results: {
        bestsellers_date: string;
        published_date: string;
        lists: Array<{
            list_id: number;
            list_name: string;
            list_name_encoded: string;
            display_name: string;
            updated: string;
            list_image: string;
            list_image_width: number;
            list_image_height: number;
            books: NYTBookResult[];
        }>;
    };
}
