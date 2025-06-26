#!/bin/bash

# 创建 TabBar 图标生成脚本
# 此脚本需要安装 Inkscape 或 rsvg-convert 来将 SVG 转换为 PNG

echo "开始生成 TabBar 图标..."

# 检查是否安装了转换工具
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg-convert"
    echo "使用 rsvg-convert 进行转换"
elif command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
    echo "使用 Inkscape 进行转换"
else
    echo "错误: 需要安装 rsvg-convert 或 Inkscape 来转换 SVG"
    echo "macOS: brew install librsvg"
    echo "或者: brew install inkscape"
    exit 1
fi

# 图标名称数组
icons=("home" "shop" "order" "chart")

# 创建单个SVG文件并转换为PNG
for icon in "${icons[@]}"; do
    echo "生成 ${icon} 图标..."
    
    # 创建普通状态的SVG
    cat > "${icon}-temp.svg" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
EOF
    
    # 根据图标类型添加具体路径
    case $icon in
        "home")
            echo '  <path d="M12 2l8 8v10h-5v-6h-6v6h-5v-10l8-8z" fill="#999"/>' >> "${icon}-temp.svg"
            ;;
        "shop")
            echo '  <path d="M3 3h18l-1 6h-16l-1-6z" fill="#999"/>' >> "${icon}-temp.svg"
            echo '  <rect x="4" y="9" width="16" height="11" fill="none" stroke="#999" stroke-width="1"/>' >> "${icon}-temp.svg"
            echo '  <circle cx="8" cy="15" r="1" fill="#999"/>' >> "${icon}-temp.svg"
            echo '  <circle cx="16" cy="15" r="1" fill="#999"/>' >> "${icon}-temp.svg"
            ;;
        "order")
            echo '  <rect x="4" y="2" width="16" height="18" fill="none" stroke="#999" stroke-width="1"/>' >> "${icon}-temp.svg"
            echo '  <line x1="7" y1="6" x2="17" y2="6" stroke="#999" stroke-width="1"/>' >> "${icon}-temp.svg"
            echo '  <line x1="7" y1="10" x2="17" y2="10" stroke="#999" stroke-width="1"/>' >> "${icon}-temp.svg"
            echo '  <line x1="7" y1="14" x2="17" y2="14" stroke="#999" stroke-width="1"/>' >> "${icon}-temp.svg"
            ;;
        "chart")
            echo '  <rect x="6" y="12" width="3" height="8" fill="#999"/>' >> "${icon}-temp.svg"
            echo '  <rect x="10" y="8" width="3" height="12" fill="#999"/>' >> "${icon}-temp.svg"
            echo '  <rect x="14" y="4" width="3" height="16" fill="#999"/>' >> "${icon}-temp.svg"
            ;;
    esac
    
    echo '</svg>' >> "${icon}-temp.svg"
    
    # 转换为PNG
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w 48 -h 48 "${icon}-temp.svg" -o "${icon}.png"
    else
        inkscape --export-type=png --export-width=48 --export-height=48 "${icon}-temp.svg" --export-filename="${icon}.png"
    fi
    
    # 创建选中状态 (将#999替换为#007AFF)
    sed 's/#999/#007AFF/g' "${icon}-temp.svg" > "${icon}-active-temp.svg"
    
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w 48 -h 48 "${icon}-active-temp.svg" -o "${icon}-active.png"
    else
        inkscape --export-type=png --export-width=48 --export-height=48 "${icon}-active-temp.svg" --export-filename="${icon}-active.png"
    fi
    
    # 清理临时文件
    rm "${icon}-temp.svg" "${icon}-active-temp.svg"
    
    echo "✓ ${icon}.png 和 ${icon}-active.png 生成完成"
done

echo "所有图标生成完成！"
echo ""
echo "生成的文件："
ls -la *.png 