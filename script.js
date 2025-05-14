let pages = {};
let currentPage = 0;
let maxPage = 1;

async function fetchData() {
  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxYrGoZ0qwgEbCSnxx7fFqtWAn90X_OegX8m3yUPlETAHtxm6YkQnJ7le6dGzTG3F9DZw/exec');
    const data = await res.json();

    data.forEach(item => {
      const pageNum = parseInt(item.page);
      if (!pages[pageNum]) {
        pages[pageNum] = { images: [], headline: '' };
      }
      if (item.headline && pages[pageNum].headline === '') {
        pages[pageNum].headline = item.headline;
      }
      if (item.img) {
        pages[pageNum].images.push({ url: item.img, note: item.note });
      }
    });

    maxPage = Math.max(...Object.keys(pages).map(n => parseInt(n)));
    renderPage();
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error);
  }
}

function renderPage() {
  const cover = document.getElementById('cover');
  const gallery = document.getElementById('gallery');
  const headline = document.getElementById('headline');

  if (currentPage === 0) {
    cover.style.display = 'flex';
    gallery.style.display = 'none';
    headline.style.display = 'none';
    return;
  }

  cover.style.display = 'none';
  gallery.style.display = 'block';
  headline.style.display = 'block';

  const page = pages[currentPage] || { images: [], headline: '' };
  headline.textContent = page.headline || '';
  gallery.innerHTML = '';

  let row1, row2;
  if (currentPage === 20) {
    row1 = document.createElement('div');
    row1.className = 'image-row full-row';
    row2 = document.createElement('div');
  } else {
    row1 = document.createElement('div');
    row1.className = 'image-row landscape';
    row2 = document.createElement('div');
    row2.className = 'image-row portrait';
  }

  let pending = page.images.length;
  page.images.forEach(({ url, note }) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      const isLandscape = ratio >= 1;

      const container = document.createElement('div');
      container.className = 'image-block';

      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.textContent = note || '';

      container.appendChild(img);
      container.appendChild(caption);

      if (currentPage === 20) {
        row1.appendChild(container);
      } else {
        (isLandscape ? row1 : row2).appendChild(container);
      }

      pending--;
      if (pending === 0) {
        gallery.appendChild(row1);
        if (currentPage !== 20) gallery.appendChild(row2);
      }
    };

    img.onerror = () => {
      pending--;
    };
  });
}
let startTouch = 0;

function handleTouchStart(e) {
  startTouch = e.touches[0].clientX;  // Lấy vị trí chạm ban đầu
}

function handleTouchEnd(e) {
  const endTouch = e.changedTouches[0].clientX;  // Lấy vị trí chạm cuối cùng
  const distance = startTouch - endTouch;  // Tính khoảng cách giữa 2 điểm chạm

  if (distance > 50) {
    // Quẹt trái -> trang sau
    nextPage();
  } else if (distance < -50) {
    // Quẹt phải -> trang trước
    prevPage();
  }
}

function nextPage() {
  if (currentPage < maxPage) {
    currentPage++;
    renderPage();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
  }
}

function createBalloon() {
    const balloon = document.createElement('img');
    balloon.className = 'floating-balloon';
    balloon.src = 'https://i.imgur.com/TxEMLVY.jpeg';  // Đường dẫn tới file PNG của bạn
    balloon.style.left = `${Math.random() * 90 + 5}%`;
    balloon.style.width = '100px';  // Điều chỉnh kích thước của bóng bay nếu cần
    balloon.style.height = '150px';  // Điều chỉnh kích thước của bóng bay nếu cần
    balloon.style.position = 'absolute';  // Đảm bảo bóng bay không ảnh hưởng tới nền trang

    document.body.appendChild(balloon);
  
    setTimeout(() => {
      balloon.remove();
    }, 4000);  // Xóa bóng bay sau 4 giây
}
  
function launchBalloons(count = 15) {
    for (let i = 0; i < count; i++) {
      setTimeout(createBalloon, i * 200);  // Tạo bóng bay lần lượt với khoảng cách 200ms
    }
}
  

function startScrapbook() {
  launchBalloons();

  setTimeout(() => {
    currentPage = 1;
    renderPage();
  }, 4000);

  document.getElementById('cover').style.display = 'none';
  document.getElementById('gallery').style.display = 'block';
}

// Lắng nghe sự kiện chạm
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchend', handleTouchEnd);
document.getElementById('startButton').addEventListener('click', startScrapbook);
fetchData();
