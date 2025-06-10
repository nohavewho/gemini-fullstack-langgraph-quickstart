const { chromium } = require('playwright');

(async () => {
    try {
        // Подключаемся к существующему Chrome через CDP
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        
        console.log('✅ Подключен к Chrome:', browser.isConnected());
        console.log('📱 Контекстов в сессии:', browser.contexts().length);
        
        // Получаем первый контекст (вкладку)
        const context = browser.contexts()[0];
        const pages = context.pages();
        
        if (pages.length > 0) {
            const page = pages[0];
            console.log('🌐 Текущая страница:', await page.title());
            console.log('🔗 URL:', page.url());
            
            // Переходим на сайт если еще не там
            if (!page.url().includes('airesearchprojects.com')) {
                await page.goto('https://airesearchprojects.com');
                await page.waitForLoadState('networkidle');
            }
            
            // Делаем скриншот
            await page.screenshot({ path: 'airesearch_test.png' });
            console.log('📸 Скриншот сохранен: airesearch_test.png');
            
            // Получаем консольные логи
            page.on('console', msg => {
                console.log('🖥️ Console:', msg.type(), msg.text());
            });
            
            // Мониторим сетевые запросы
            page.on('request', request => {
                console.log('📡 Request:', request.method(), request.url());
            });
            
            page.on('response', response => {
                console.log('📥 Response:', response.status(), response.url());
            });
            
            // Получаем заголовок страницы
            const title = await page.title();
            console.log('📄 Заголовок страницы:', title);
            
            // Получаем все элементы на странице
            const elements = await page.$$('*');
            console.log('🔍 Элементов на странице:', elements.length);
            
            // Проверяем есть ли формы входа
            const loginForms = await page.$$('form, input[type="email"], input[type="password"]');
            console.log('🔐 Форм входа найдено:', loginForms.length);
            
        } else {
            console.log('❌ Нет открытых страниц');
        }
        
        console.log('✅ Тестирование завершено');
        
    } catch (error) {
        console.error('❌ Ошибка подключения к Chrome:', error.message);
        console.log('💡 Убедитесь что Chrome запущен с --remote-debugging-port=9222');
    }
})(); 