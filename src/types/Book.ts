export interface GoogleBookVolumeInfo {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: Array<{
        type: string;
        identifier: string;
    }>;
    imageLinks?: {
        smallThumbnail?: string;
        thumbnail?: string;
    };
    previewLink?: string;
    infoLink?: string;
}

export interface GoogleBookResult {
    id: string;
    volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBooksApiResponse {
    kind: string;
    totalItems: number;
    items?: GoogleBookResult[];
}

export interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    publishedYear: string;
    previewLink: string;
    // New fields
    isbn?: string;
    publisher?: string;
    pageCount?: number;
    subjects?: string[];
}
