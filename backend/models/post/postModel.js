class Post {
    constructor(title, content, date, image, embeddedImages = [], tags = [], slug = '', isMainNews = false) {
        this.title = title;
        this.content = content;
        this.date = date;
        this.image = image;
        this.embeddedImages = embeddedImages;
        this.tags = tags;
        this.slug = slug;
        this.isMainNews = isMainNews;
    }
}
module.exports = Post;
