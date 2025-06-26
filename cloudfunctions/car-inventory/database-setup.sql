-- 其他品牌库存表结构和索引设置
-- 模型标识：other_brand_inventory

-- 创建表（如果不存在）
CREATE TABLE IF NOT EXISTS `other_brand_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `VIN` varchar(17) NOT NULL COMMENT '车架号',
  `brand` varchar(50) NOT NULL COMMENT '品牌',
  `model` varchar(100) NOT NULL COMMENT '车型',
  `color` varchar(30) DEFAULT NULL COMMENT '颜色',
  `production_date` date NOT NULL COMMENT '出厂日期(YYYY-MM-DD格式)',
  `price` decimal(10,2) DEFAULT NULL COMMENT '价格',
  `stock_quantity` int(11) DEFAULT 0 COMMENT '库存数量',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='其他品牌库存表';

-- 为VIN字段创建唯一索引（防止重复车架号）
ALTER TABLE `other_brand_inventory` 
ADD UNIQUE INDEX `idx_vin_unique` (`VIN`) COMMENT 'VIN车架号唯一索引';

-- 为常用查询字段创建索引
CREATE INDEX `idx_brand` ON `other_brand_inventory` (`brand`);
CREATE INDEX `idx_model` ON `other_brand_inventory` (`model`);
CREATE INDEX `idx_production_date` ON `other_brand_inventory` (`production_date`);
CREATE INDEX `idx_created_at` ON `other_brand_inventory` (`created_at`);

-- 查看表结构
DESCRIBE `other_brand_inventory`;

-- 查看索引
SHOW INDEX FROM `other_brand_inventory`; 