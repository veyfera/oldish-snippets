const reportsContainer = $('.reports');
reportsContainer.on('click', '.reports__item', openModal);

const reportsModal = $('#report-details-modal');
const reportsSearch = $('#reports-search').on('keyup', filterUsers);
let reports;


async function getAllUsers() {
    const response = await fetch('http://127.0.0.1:3000/');
    const users = await response.json();

    return users;
}

async function filterUsers(event) {
    const query = event.target.value;
    const response = await fetch(`http://127.0.0.1:3000?term=${query}`);
    const users = await response.json();

    reportsContainer[0].innerHTML = users.map(reportItem).join('');
}

function openModal(event) {
    const name = $(this).find('.reports__item-title').text()
    const details = reports.find(r => r.name === name);

    console.log(details)
    reportsModal[0].innerHTML = reportDetails(details);
    reportsModal.modal();
}

const reportItem = (user) => {
    return `
        <div class="reports__item">
            <div class="reports__item-title">${user.name}</div>
            <div class="reports__item-phone"><img src="images/phone.svg" alt="📱">${user.phone}</div>
            <div class="reports__item-email"><img src="images/email.svg" alt="📧">${user.email}</div>
        </div>
    `;
};

const reportDetails = (user) => {
    return `
        <div class="reports__modal-title">
            ${user.name}
            <a href="#close-modal" rel="modal:close"><img src="images/close.svg" alt="X"></a>
        </div>
        <div class="reports__modal-detail">
            <div class="reports__modal-detail-label">
                Телефон:
            </div>
            <div class="reports__modal-detail-text">
                ${user.phone}
            </div>

            <div class="reports__modal-detail-label">
                Почта:
            </div>
            <div class="reports__modal-detail-text">
                ${user.email}
            </div>

            <div class="reports__modal-detail-label">
                Дата приема:
            </div>
            <div class="reports__modal-detail-text">
                ${user.hire_date}
            </div>

            <div class="reports__modal-detail-label">
                Должность:
            </div>
            <div class="reports__modal-detail-text">
                ${user.position_name}
            </div>
            <div class="reports__modal-detail-label">
                Подразделение:
            </div>
            <div class="reports__modal-detail-text">
                ${user.department}
            </div>
        </div>

        <div class="reports__modal-detail-extra">
            <div class="reports__modal-detail-label">
                Дополнительная информация:
            </div>
            <div class="reports__modal-detail-text">
                Разработчики используют текст в качестве заполнителя макта страницы. Разработчики используют текст в качестве заполнителя макта страницы.
            </div>
        </div>
    `;
};

(async () => {
    reports = await getAllUsers();
    reportsContainer[0].innerHTML = reports.map(reportItem).join('');

})();

