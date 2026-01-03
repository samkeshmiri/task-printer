#!/bin/bash

echo "==================================="
echo "  Munbyn ITPP047 Printer Finder"
echo "==================================="
echo ""
echo "Searching for connected USB printers..."
echo ""

# macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Using macOS USB detection:"
    echo ""
    system_profiler SPUSBDataType | grep -B 3 -A 10 -i "printer\|munbyn\|thermal" | grep -E "Product ID:|Vendor ID:|Product Name:"
    echo ""
    echo "---"
    echo ""
    echo "Look for entries like:"
    echo "  Vendor ID: 0x0dd4 (or 0x0519)"
    echo "  Product ID: 0x0006 (or similar)"
    echo ""
    echo "Update these values in server/printer/printer.js"
fi

echo ""
echo "==================================="
