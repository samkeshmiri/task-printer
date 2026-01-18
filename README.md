# Task Printer

A receipt printer app for printing individual tasks on receipt paper. Simple, fast task printing with large, readable text perfect for physical task tracking!

## Features

- �️ Print individual tasks in large, bold text
- ✂️ Auto text-wrapping for long task names (fits 80mm receipt paper)
- 🔌 Persistent printer connection - print multiple tasks without reconnecting
- 🎨 Clean, modern web interface
- 💻 Command line interface for quick printing
- 🖨️ Support for Munbyn ITPP047 thermal receipt printer
- 🔄 Mock mode when printer not available

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## Usage

### Web Interface

- **Enter a task name** in the input field
- **Click Print** or press Enter to print immediately
- Tasks are printed in large, bold text centered on the receipt
- Perfect for creating physical task cards to track your progress

### Command Line Interface

For quick printing from the terminal:
```bash
# Print a single task
tprint "Buy groceries"

# Print multiple tasks (each as separate slips)
tprint "Buy groceries" "Walk the dog" "Finish report"
```

### Printing
   
**Features:**
- Text automatically wraps if task names are too long (max 16 characters per line in large text)
- Printer stays connected between prints - no need to reconnect
- Each task prints as its own tearable slip

### Connecting Your Munbyn ITPP047 Printer

The app is configured for the **Munbyn ITPP047** thermal receipt printer. To connect:

1. **Connect your printer via USB** and power it on

2. **Find your printer's USB IDs**:
   ```bash
   ./find-printer.sh
   ```
   Or manually:
   ```bash
   system_profiler SPUSBDataType | grep -B 3 -A 10 -i "printer"
   ```
   Look for:
   - `USB Vendor ID: 0x0483` (or similar)
   - `USB Product ID: 0x5743` (or similar)

3. **Update printer IDs if needed** in [server/printer/printer.js](server/printer/printer.js):
   ```javascript
   const vendorId = 0x0483;  // Your vendor ID
   const productId = 0x5743; // Your product ID
   ```

4. **Restart the server:**
   ```bash
   npm start
   ```

The server will automatically attempt to connect to the printer on startup. If successful, you'll see:
```
✓ Printer connected successfully!
```

If it fails, the app continues in mock mode (console output only) so you can still test the functionality.

## Technologies Used

- **Backend:** Node.js + Express
- **CLI:** Node.js with ES modules
- **Printer:** Munbyn ITPP047 (80mm thermal receipt printer)
- **Printer Protocol:** ESC/POS via USB
- **USB Communication:** node-usb library
- **Frontend:** Vanilla JavaScript, HTML5, CSS3

## Project Structure

```
task-printer/
├── tprint.js              # CLI script
├── server/
│   ├── index.js           # Express server
│   ├── routes/
│   │   └── tasks.js       # Print API endpoint
│   └── printer/
│       └── printer.js     # Printer service
├── public/
│   ├── index.html         # UI
│   ├── styles.css         # Styling
│   └── app.js             # Frontend JavaScript
├── bin/
│   └── tprint-simple      # Alternative CLI wrapper
├── package.json
└── README.md
```

## API Endpoints

- `POST /api/print` - Print a task by name

## Receipt Printer Specifications

- **Model:** Munbyn ITPP047
- **Paper width:** 80mm (79.5±0.5mm)
- **Print speed:** 200mm/sec
- **Protocol:** ESC/POS
- **Connection:** USB
- **Text capacity:** 16 characters per line in double-width mode (large text)
- **Auto-wrapping:** Yes - long task names automatically wrap to multiple lines

## Future Enhancements

- [ ] Multiple printer profiles
- [ ] Custom print templates and fonts
- [ ] QR code generation for digital task tracking
- [ ] Print history and statistics
- [ ] Batch printing from files
- [ ] Integration with task management apps

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## License

ISC
