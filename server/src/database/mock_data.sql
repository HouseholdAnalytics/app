-- Очистка таблиц
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Сброс последовательности для категорий
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Добавление категорий
INSERT INTO categories (name, type, user_id) VALUES
-- Категории доходов
('Зарплата', 'income', 1),
('Фриланс', 'income', 1),
('Инвестиции', 'income', 1),
('Подарки', 'income', 1),

-- Категории расходов
('Продукты', 'expense', 1),
('Рестораны', 'expense', 1),
('Транспорт', 'expense', 1),
('Развлечения', 'expense', 1),
('Одежда', 'expense', 1),
('Жилье', 'expense', 1),
('Здоровье', 'expense', 1),
('Путешествия', 'expense', 1);

-- Сброс последовательности для транзакций
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- Добавление транзакций за последние 3 месяца
-- Текущий месяц
INSERT INTO transactions (user_id, category_id, amount, date, comment) VALUES
-- Доходы текущего месяца
(1, (SELECT id FROM categories WHERE name = 'Зарплата' AND user_id = 1), 150000.00, CURRENT_DATE - INTERVAL '15 days', 'Зарплата за март'),
(1, (SELECT id FROM categories WHERE name = 'Фриланс' AND user_id = 1), 25000.00, CURRENT_DATE - INTERVAL '10 days', 'Проект по разработке'),
(1, (SELECT id FROM categories WHERE name = 'Инвестиции' AND user_id = 1), 15000.00, CURRENT_DATE - INTERVAL '5 days', 'Дивиденды по акциям'),

-- Расходы текущего месяца
(1, (SELECT id FROM categories WHERE name = 'Продукты' AND user_id = 1), 15000.00, CURRENT_DATE - INTERVAL '20 days', 'Продукты на неделю'),
(1, (SELECT id FROM categories WHERE name = 'Рестораны' AND user_id = 1), 5000.00, CURRENT_DATE - INTERVAL '18 days', 'Ужин в ресторане'),
(1, (SELECT id FROM categories WHERE name = 'Транспорт' AND user_id = 1), 3000.00, CURRENT_DATE - INTERVAL '15 days', 'Такси'),
(1, (SELECT id FROM categories WHERE name = 'Развлечения' AND user_id = 1), 8000.00, CURRENT_DATE - INTERVAL '12 days', 'Кино и развлечения'),
(1, (SELECT id FROM categories WHERE name = 'Одежда' AND user_id = 1), 12000.00, CURRENT_DATE - INTERVAL '10 days', 'Новая одежда'),
(1, (SELECT id FROM categories WHERE name = 'Жилье' AND user_id = 1), 45000.00, CURRENT_DATE - INTERVAL '5 days', 'Аренда квартиры'),
(1, (SELECT id FROM categories WHERE name = 'Здоровье' AND user_id = 1), 5000.00, CURRENT_DATE - INTERVAL '3 days', 'Визит к врачу');

-- Предыдущий месяц
INSERT INTO transactions (user_id, category_id, amount, date, comment) VALUES
-- Доходы предыдущего месяца
(1, (SELECT id FROM categories WHERE name = 'Зарплата' AND user_id = 1), 150000.00, CURRENT_DATE - INTERVAL '45 days', 'Зарплата за февраль'),
(1, (SELECT id FROM categories WHERE name = 'Фриланс' AND user_id = 1), 30000.00, CURRENT_DATE - INTERVAL '40 days', 'Веб-разработка'),
(1, (SELECT id FROM categories WHERE name = 'Подарки' AND user_id = 1), 10000.00, CURRENT_DATE - INTERVAL '35 days', 'Подарок на день рождения'),

-- Расходы предыдущего месяца
(1, (SELECT id FROM categories WHERE name = 'Продукты' AND user_id = 1), 14000.00, CURRENT_DATE - INTERVAL '50 days', 'Продукты'),
(1, (SELECT id FROM categories WHERE name = 'Рестораны' AND user_id = 1), 7000.00, CURRENT_DATE - INTERVAL '48 days', 'Ресторан'),
(1, (SELECT id FROM categories WHERE name = 'Транспорт' AND user_id = 1), 4000.00, CURRENT_DATE - INTERVAL '45 days', 'Общественный транспорт'),
(1, (SELECT id FROM categories WHERE name = 'Развлечения' AND user_id = 1), 10000.00, CURRENT_DATE - INTERVAL '42 days', 'Развлечения'),
(1, (SELECT id FROM categories WHERE name = 'Одежда' AND user_id = 1), 15000.00, CURRENT_DATE - INTERVAL '40 days', 'Одежда'),
(1, (SELECT id FROM categories WHERE name = 'Жилье' AND user_id = 1), 45000.00, CURRENT_DATE - INTERVAL '35 days', 'Аренда'),
(1, (SELECT id FROM categories WHERE name = 'Путешествия' AND user_id = 1), 30000.00, CURRENT_DATE - INTERVAL '30 days', 'Поездка на выходные');

-- Позапрошлый месяц
INSERT INTO transactions (user_id, category_id, amount, date, comment) VALUES
-- Доходы позапрошлого месяца
(1, (SELECT id FROM categories WHERE name = 'Зарплата' AND user_id = 1), 150000.00, CURRENT_DATE - INTERVAL '75 days', 'Зарплата за январь'),
(1, (SELECT id FROM categories WHERE name = 'Фриланс' AND user_id = 1), 20000.00, CURRENT_DATE - INTERVAL '70 days', 'Консультации'),
(1, (SELECT id FROM categories WHERE name = 'Инвестиции' AND user_id = 1), 20000.00, CURRENT_DATE - INTERVAL '65 days', 'Инвестиционный доход'),

-- Расходы позапрошлого месяца
(1, (SELECT id FROM categories WHERE name = 'Продукты' AND user_id = 1), 16000.00, CURRENT_DATE - INTERVAL '80 days', 'Продукты'),
(1, (SELECT id FROM categories WHERE name = 'Рестораны' AND user_id = 1), 6000.00, CURRENT_DATE - INTERVAL '78 days', 'Кафе'),
(1, (SELECT id FROM categories WHERE name = 'Транспорт' AND user_id = 1), 5000.00, CURRENT_DATE - INTERVAL '75 days', 'Такси'),
(1, (SELECT id FROM categories WHERE name = 'Развлечения' AND user_id = 1), 12000.00, CURRENT_DATE - INTERVAL '72 days', 'Развлечения'),
(1, (SELECT id FROM categories WHERE name = 'Одежда' AND user_id = 1), 18000.00, CURRENT_DATE - INTERVAL '70 days', 'Одежда'),
(1, (SELECT id FROM categories WHERE name = 'Жилье' AND user_id = 1), 45000.00, CURRENT_DATE - INTERVAL '65 days', 'Аренда'),
(1, (SELECT id FROM categories WHERE name = 'Здоровье' AND user_id = 1), 8000.00, CURRENT_DATE - INTERVAL '60 days', 'Медицинские расходы'); 