# 🔒 PinkyShare Pro (E2EE)

```text
  _____ _       _             _____ _                       
 |  __ (_)     | |           / ____| |                      
 | |__) | _ __ | | ___   _  | (___ | |__   __ _ _ __ ___  
 |  ___/ | '_ \| |/ / | | |  \___ \| '_ \ / _` | '__/ _ \ 
 | |   | | | | |   <| |_| |  ____) | | | | (_| | | |  __/ 
 |_|   |_|_| |_|_|\_\\__, | |_____/|_| |_|\__,_|_|  \___| 
                      __/ |                               
                     |___/      v2.0 | SECURE P2P TRANSFER


🚀 Overview
PinkyShare Pro is a high-performance, browser-based file sharing utility designed for Digital Minimalism and Anonymity. It enables direct, peer-to-peer (P2P) transfers between devices (Phone to PC, PC to PC) without ever uploading your data to a central server.

Every transfer is protected with industry-standard AES-GCM 256-bit Encryption, ensuring your files stay private even on public networks.

✨ Key Features
End-to-End Encryption (E2EE): All data is encrypted/decrypted locally using the Web Crypto API.

Zero-Server Storage: Files move directly between browsers using WebRTC.

Automatic Folder Zipping: Drop an entire directory, and the app zips it on-the-fly using JSZip.

Adaptive Flow Control: A "Pull-based" ACK protocol prevents mobile buffer overflows and the "0 MB/s" hang.

Ghost Connection Recovery: Integrated heartbeat (Ping/Pong) system detects and clears dead connections instantly.

Anonymity-First: No accounts, no tracking, and 4-digit PIN pairing.

🛠️ Tech Stack
Network: PeerJS (WebRTC Wrapper)

Security: Web Crypto API (AES-GCM 256-bit)

Compression: JSZip

UI: Glassmorphism CSS / Vanilla JavaScript

📖 How to Use
Open the application on both the Sender and Receiver devices.

Pair the devices by entering the 4-digit PIN of the partner device.

Drag & Drop files or entire folders into the browser.

Wait for the "Ding!" sound—your file is securely saved.

⚠️ Performance Notes for Mobile
Keep Screen On: Mobile browsers often kill WebRTC connections if the screen turns off or the tab is backgrounded.

Browser Choice: Recommended for Chrome, Firefox, or Brave for full Web Crypto API support.
