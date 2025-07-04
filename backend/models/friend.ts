export interface Friend {
    userId: string;
    friendId: string;
    relationship: string; // e.g., 'friend', 'family', 'colleague'
    status: string; // e.g., 'pending', 'accepted', 'blocked'
}
