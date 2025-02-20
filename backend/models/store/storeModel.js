class Stores {
    constructor(itemId, itemName, date, itemDescription, itemType, itemDiscount, itemPrice, itemImage, embeddedImages = []) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.date = date;
        this.itemDescription = itemDescription;
        this.itemType = itemType;
        this.itemDiscount = itemDiscount;
        this.itemPrice = itemPrice;
        this.itemImage = itemImage;
        this.embeddedImages = embeddedImages;
    }
}
module.exports = Stores;
