function cutStr(start, end, str) {
    const startIndex = str.indexOf(start);
    if (startIndex === -1) return ''; // Trả về chuỗi rỗng nếu không tìm thấy chuỗi bắt đầu

    const endIndex = str.indexOf(end, startIndex + start.length);
    if (endIndex === -1) return ''; // Trả về chuỗi rỗng nếu không tìm thấy chuỗi kết thúc

    return str.substring(startIndex + start.length, endIndex).trim();
}

// Chuyển đổi giới tính thành văn bản và hình ảnh tương ứng
function convertSex(sex) {
    switch (sex) {
        case 1:
            return { name: 'Nam', imageUrl: '/images/sex/male.png' };
        case 2:
            return { name: 'Nữ', imageUrl: '/images/sex/female.png' };
        default:
            return { name: 'Unknown', imageUrl: '/images/sex/unknown.png' };
    }
}

// Chuyển đổi phe phái thành văn bản và hình ảnh tương ứng
function convertFaction(faction) {
    switch (faction) {
        case 1:
            return { name: 'Thiên Thanh', imageUrl: '/images/faction/Cerulean_Order_logo.webp' };
        case 2:
            return { name: 'Huyết Tộc', imageUrl: '/images/faction/Crimson_legion_logo.webp' };
        default:
            return { name: 'Chưa Có Phe Phái', imageUrl: '/images/sex/unknown.png' };
    }
}

// Chuyển đổi chủng tộc thành văn bản và hình ảnh tương ứng
function convertRace(race) {
    switch (race) {
        case 1:
            return { name: 'Thiên', imageUrl: '/images/races/race-feng.png' };
        case 2:
            return { name: 'Long', imageUrl: '/images/races/race-wan.png' };
        case 3:
            return { name: 'Linh', imageUrl: '/images/races/race-lin.png' };
        case 4:
            return { name: 'Nhân', imageUrl: '/images/races/race-sheng.png' };
        default:
            return { name: 'Unknown', imageUrl: '/images/sex/unknown.png' };
    }
}

// Chuyển đổi số tiền thành vàng, bạc và đồng
function convertMoney(money) {
    const gold = Math.floor(money / 10000); // 10000 đơn vị = 1 vàng
    const silver = Math.floor((money % 10000) / 100); // 100 đơn vị = 1 bạc
    const copper = money % 100; // 1 đơn vị = 1 đồng
    return { gold: gold, silver: silver, copper: copper };
}

// Chuyển đổi lớp nhân vật thành văn bản và hình ảnh tương ứng
function convertJob(job) {
    switch (job) {
        case 1:
            return { name: 'Kiếm Sư', imageUrl: '/images/jobs/class-icons-blademaster.png' };
        case 2:
            return { name: 'Võ Sư', imageUrl: '/images/jobs/class-icons-kungfumaster.png' };
        case 3:
            return { name: 'Pháp Sư', imageUrl: '/images/jobs/class-icons-forcemaster.png' };
        case 4:
            return { name: 'Xạ Thủ', imageUrl: '/images/jobs/class-icons-gunslinger.png' };
        case 5:
            return { name: 'Cuồng Long ', imageUrl: '/images/jobs/class-icons-destroyer.png' };
        case 6:
            return { name: 'Triệu Hồi Sư', imageUrl: '/images/jobs/class-icons-summoner.png' };
        case 7:
            return { name: 'Sát Thủ', imageUrl: '/images/jobs/class-icons-assassin.png' };
        case 8:
            return { name: 'Kiếm Vũ', imageUrl: '/images/jobs/class-icons-bladedancer.png' };
        case 9:
            return { name: 'Thuật Sư', imageUrl: '/images/jobs/class-icons-warlock.png' };
        case 10:
            return { name: 'Khí Công Sư', imageUrl: '/images/jobs/class-icons-soulfighter.png' };
        case 11:
            return { name: 'Hộ Vệ', imageUrl: '/images/jobs/class-icons-warden.png' };
        case 12:
            return { name: 'Cung Thủ', imageUrl: '/images/jobs/class-icons-zenarcher.png' };
        case 13:
            return { name: 'Thiên Đạo Sư', imageUrl: '/images/jobs/class-icons-astromancer.png' };
        case 14:
            return { name: 'Song Kiếm Sư', imageUrl: '/images/jobs/class-icons-dualblade.png' };
        default:
            return { name: 'Unknown', imageUrl: '/images/jobs/class-icons-unknown.png' };
    }
}

module.exports = {
    cutStr: cutStr,
    convertSex: convertSex,
    convertFaction: convertFaction,
    convertRace: convertRace,
    convertMoney: convertMoney,
    convertJob: convertJob,
};
