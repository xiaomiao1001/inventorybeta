-- 郭四车行库存管理系统 - 数据库表结构
-- 创建时间: 2025-01-22
-- 数据库类型: CloudBase MySQL

-- 1. 车辆价格表
CREATE TABLE IF NOT EXISTS vehicle_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series VARCHAR(50) NOT NULL COMMENT '车型系列',
    model VARCHAR(100) NOT NULL COMMENT '车型',
    factory_config TEXT COMMENT '出厂配置',
    policy_discount DECIMAL(10,2) DEFAULT 0.00 COMMENT '政策优惠',
    county_dealer_price DECIMAL(10,2) NOT NULL COMMENT '旗县经销商价格',
    township_dealer_price DECIMAL(10,2) NOT NULL COMMENT '乡镇经销商价格',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_series (series),
    INDEX idx_model (model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆价格配置表';

-- 2. 鸿日车库存表
CREATE TABLE IF NOT EXISTS hongri_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vin_code VARCHAR(17) UNIQUE NOT NULL COMMENT 'VIN码',
    series VARCHAR(50) NOT NULL COMMENT '车型系列',
    model VARCHAR(100) NOT NULL COMMENT '车型',
    config TEXT COMMENT '配置',
    color VARCHAR(30) NOT NULL COMMENT '颜色',
    headquarters_out_date DATE COMMENT '总部出库日期',
    warehouse_in_date DATE NOT NULL COMMENT '入库日期',
    inventory_status ENUM('在库', '已出库', '预定', '维修中') DEFAULT '在库' COMMENT '库存状态',
    operator VARCHAR(50) COMMENT '操作人',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vin (vin_code),
    INDEX idx_series_model (series, model),
    INDEX idx_status (inventory_status),
    INDEX idx_warehouse_date (warehouse_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鸿日车库存表';

-- 3. 二手车库存表
CREATE TABLE IF NOT EXISTS secondhand_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    color VARCHAR(30) NOT NULL COMMENT '颜色',
    warehouse_in_date DATE NOT NULL COMMENT '入库日期',
    source_customer VARCHAR(100) COMMENT '来源客户姓名',
    purchase_price DECIMAL(10,2) NOT NULL COMMENT '收车价格',
    inventory_status ENUM('在库', '已出库', '预定', '维修中') DEFAULT '在库' COMMENT '库存状态',
    operator VARCHAR(50) COMMENT '操作人',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand (brand),
    INDEX idx_status (inventory_status),
    INDEX idx_warehouse_date (warehouse_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二手车库存表';

-- 4. 其他品牌车库存表
CREATE TABLE IF NOT EXISTS other_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vin_code VARCHAR(17) COMMENT 'VIN码',
    series VARCHAR(50) NOT NULL COMMENT '车型系列',
    model VARCHAR(100) NOT NULL COMMENT '车型',
    config TEXT COMMENT '配置',
    color VARCHAR(30) NOT NULL COMMENT '颜色',
    headquarters_out_date DATE COMMENT '总部出库日期',
    warehouse_in_date DATE NOT NULL COMMENT '入库日期',
    inventory_status ENUM('在库', '已出库', '预定', '维修中') DEFAULT '在库' COMMENT '库存状态',
    operator VARCHAR(50) COMMENT '操作人',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vin (vin_code),
    INDEX idx_series_model (series, model),
    INDEX idx_status (inventory_status),
    INDEX idx_warehouse_date (warehouse_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='其他品牌车库存表';

-- 5. 客户信息表
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') COMMENT '性别',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    phone VARCHAR(20) COMMENT '电话号码',
    address TEXT COMMENT '地址',
    id_card_photo_url VARCHAR(500) COMMENT '身份证照片URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_id_card (id_card),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户信息表';

-- 6. 销售明细表
CREATE TABLE IF NOT EXISTS sales_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date DATE NOT NULL COMMENT '销售日期',
    vehicle_type ENUM('鸿日车', '二手车', '其他品牌') NOT NULL COMMENT '车辆类型',
    vehicle_id INT NOT NULL COMMENT '车辆ID',
    customer_id INT NOT NULL COMMENT '客户ID',
    sale_type ENUM('零售', '批发') NOT NULL COMMENT '销售类型',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '销售总金额',
    payment_methods JSON COMMENT '支付方式详情',
    salesperson VARCHAR(50) COMMENT '销售人员',
    invoice_photo_url VARCHAR(500) COMMENT '发票照片URL',
    certificate_photo_url VARCHAR(500) COMMENT '合格证照片URL',
    is_registered BOOLEAN DEFAULT FALSE COMMENT '是否下户',
    dealer_name VARCHAR(100) COMMENT '经销商名称(批发)',
    dealer_level ENUM('高级批发商', '低级批发商') COMMENT '经销商等级',
    pickup_date DATE COMMENT '提车时间',
    handler VARCHAR(50) COMMENT '经手人',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_sale_date (sale_date),
    INDEX idx_vehicle_type_id (vehicle_type, vehicle_id),
    INDEX idx_customer (customer_id),
    INDEX idx_salesperson (salesperson)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售明细表';

-- 7. 赊欠信息表
CREATE TABLE IF NOT EXISTS debt_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_record_id INT NOT NULL COMMENT '销售记录ID',
    customer_id INT NOT NULL COMMENT '客户ID',
    debt_amount DECIMAL(10,2) NOT NULL COMMENT '赊欠金额',
    agreed_repay_date DATE NOT NULL COMMENT '约定还款日期',
    actual_repay_date DATE COMMENT '实际还款日期',
    repay_status ENUM('未还款', '部分还款', '已还清') DEFAULT '未还款' COMMENT '还款状态',
    reminder_status ENUM('未提醒', '已提醒', '逾期') DEFAULT '未提醒' COMMENT '提醒状态',
    repaid_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '已还金额',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_record_id) REFERENCES sales_records(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer (customer_id),
    INDEX idx_repay_date (agreed_repay_date),
    INDEX idx_status (repay_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赊欠信息表';

-- 8. 旧车折抵信息表
CREATE TABLE IF NOT EXISTS trade_in_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_record_id INT NOT NULL COMMENT '销售记录ID',
    customer_id INT NOT NULL COMMENT '客户ID',
    trade_in_amount DECIMAL(10,2) NOT NULL COMMENT '旧车折抵金额',
    old_car_brand VARCHAR(50) NOT NULL COMMENT '旧车品牌',
    old_car_color VARCHAR(30) NOT NULL COMMENT '旧车颜色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_record_id) REFERENCES sales_records(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer (customer_id),
    INDEX idx_brand (old_car_brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='旧车折抵信息表';

-- 9. 经销商配置价格表
CREATE TABLE IF NOT EXISTS dealer_config_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealer_name VARCHAR(100) NOT NULL COMMENT '经销商名称',
    dealer_level ENUM('高级批发商', '低级批发商') NOT NULL COMMENT '经销商等级',
    lithium_battery_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '锂电池价格',
    lithium_processing_fee DECIMAL(8,2) DEFAULT 0.00 COMMENT '锂电池加工费',
    lead_acid_trade_in DECIMAL(8,2) DEFAULT 0.00 COMMENT '铅酸电池折抵',
    power_steering_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '方向助力价格',
    range_extender_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '增程器价格',
    diesel_heater_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '柴暖价格',
    aluminum_wheel_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '铝轮价格',
    seat_mat_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '坐垫脚垫价格',
    wheel_cover_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '轮毂盖价格',
    insurance_loading_fee DECIMAL(8,2) DEFAULT 0.00 COMMENT '保险装车费',
    freight_price DECIMAL(8,2) DEFAULT 0.00 COMMENT '运费',
    profit_margin DECIMAL(8,2) DEFAULT 0.00 COMMENT '利润',
    bonus_deduction DECIMAL(8,2) DEFAULT 0.00 COMMENT '奖励核减',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_dealer_name (dealer_name),
    INDEX idx_dealer_level (dealer_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经销商配置价格表';

-- 10. 用户权限表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
    name VARCHAR(50) NOT NULL COMMENT '用户姓名',
    role ENUM('所有者', '管理员', '销售人员', '经销商') NOT NULL COMMENT '用户角色',
    phone VARCHAR(20) COMMENT '联系电话',
    status ENUM('正常', '禁用') DEFAULT '正常' COMMENT '用户状态',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限表';

-- 11. 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT COMMENT '操作用户ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_object VARCHAR(100) NOT NULL COMMENT '操作对象',
    before_data JSON COMMENT '操作前数据',
    after_data JSON COMMENT '操作后数据',
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    remarks TEXT COMMENT '备注',
    INDEX idx_user (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_time (operation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入基础数据

-- 插入默认用户
INSERT INTO users (openid, name, role, phone) VALUES 
('admin_default', '系统管理员', '所有者', ''),
('demo_manager', '演示管理员', '管理员', ''),
('demo_sales', '演示销售员', '销售人员', '')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 插入经销商配置数据
INSERT INTO dealer_config_prices (dealer_name, dealer_level, lithium_battery_price, lithium_processing_fee, lead_acid_trade_in, power_steering_price, range_extender_price, diesel_heater_price, aluminum_wheel_price, seat_mat_price, wheel_cover_price, insurance_loading_fee, freight_price, profit_margin, bonus_deduction) VALUES 
('新街', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('后旗', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('沙海', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('蛮会', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('棋盘井', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('磴口', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('二道桥', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('三道桥', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('阿拉善左旗', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('五原', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('头道桥', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('乌海海南', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('天吉泰', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('乌达', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('额济纳旗', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('前旗', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('千里山', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('碱贵', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('德令山', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00),
('乌审旗', '高级批发商', 800.00, 50.00, 200.00, 300.00, 1200.00, 800.00, 400.00, 150.00, 80.00, 100.00, 200.00, 500.00, 100.00),
('塔尔湖', '低级批发商', 850.00, 60.00, 180.00, 320.00, 1250.00, 820.00, 420.00, 160.00, 90.00, 120.00, 250.00, 450.00, 80.00)
ON DUPLICATE KEY UPDATE dealer_level = VALUES(dealer_level);

-- 插入车辆价格示例数据
INSERT INTO vehicle_prices (series, model, factory_config, policy_discount, county_dealer_price, township_dealer_price) VALUES 
('鸿日S系列', 'S350标准版', '标准配置,铅酸电池,手动方向', 500.00, 8500.00, 8800.00),
('鸿日S系列', 'S350豪华版', '豪华配置,锂电池,助力方向', 800.00, 12500.00, 12800.00),
('鸿日U系列', 'U650标准版', '标准配置,铅酸电池,手动方向', 600.00, 9500.00, 9800.00),
('鸿日U系列', 'U650豪华版', '豪华配置,锂电池,助力方向', 1000.00, 15500.00, 15800.00)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP; 