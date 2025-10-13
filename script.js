document.addEventListener('DOMContentLoaded', () => {
    // Ánh xạ các phần tử input
    const schoolInput = document.getElementById('school-input');
    const nameInput = document.getElementById('name-input');
    const dobInput = document.getElementById('dob-input');
    const expiryInput = document.getElementById('expiry-input');
    const imageInput = document.getElementById('image-input');
    const downloadBtn = document.getElementById('download-btn');

    // Ánh xạ các phần tử hiển thị trên thẻ
    const schoolOutput = document.getElementById('school-output');
    const nameOutput = document.getElementById('name-output');
    const dobOutput = document.getElementById('dob-output');
    const expiryOutput = document.getElementById('expiry-output');
    const profilePic = document.getElementById('profile-pic');
    const idCard = document.querySelector('.id-card');

    // Cập nhật text từ input lên thẻ (thêm dấu hai chấm cho tên và dob)
    schoolInput.addEventListener('input', () => {
        schoolOutput.textContent = schoolInput.value.toUpperCase() || 'IUH';
    });

    nameInput.addEventListener('input', () => {
        nameOutput.textContent = `: ${nameInput.value.toUpperCase()}` || ': VAN KHANH DANG';
    });

    dobInput.addEventListener('input', () => {
        dobOutput.textContent = `: ${dobInput.value}` || ': 12/11/2025';
    });
    
    expiryInput.addEventListener('input', () => {
        expiryOutput.textContent = expiryInput.value || '11/11/2030';
    });

    // Xử lý thay đổi ảnh đại diện
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePic.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Chức năng tải thẻ về máy với chất lượng cao
    downloadBtn.addEventListener('click', () => {
        // Tạm thời bỏ hiệu ứng xoay để ảnh chụp được thẳng
        const cardWrapper = document.querySelector('.id-card-wrapper');
        cardWrapper.style.transform = 'rotate(0deg)';

        html2canvas(idCard, {
            scale: 4, // Tăng độ phân giải ảnh x4
            useCORS: true,
            backgroundColor: null // Giữ nền trong suốt nếu có
        }).then(canvas => {
            // Trả lại hiệu ứng xoay sau khi chụp xong
            cardWrapper.style.transform = 'rotate(5deg)'; 
            
            const link = document.createElement('a');
            link.download = 'the-sinh-vien-tao-tu-web.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Lỗi khi tạo ảnh thẻ:', err);
            alert('Đã xảy ra lỗi, vui lòng thử lại.');
        });
    });
});
