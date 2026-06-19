# SpeakSpace-Local Requirements Specification Blueprint

### 1. Introduction & Background
1.1 Product Vision 
The core purpose of developing SpeakSpace Local is to build a voice assistant system that operates entirely on the local host (Localhost), combining a low latency experience with enterprise-grade security defenses.


1.2 Key Objectives
Implement an asynchronous control plane pipeline for local "STT -> LLM -> TTS" data flows.
Adhere to Security Compliance principles to ensure the system is capable of operating stably within a "(Air-Gapped)" environment.



### 2. Stakeholders & User Stories
2.1 Stakeholder Analysis
Client / Enterprise Executive: Prioritizes absolute prevention of data leakage (1.2 disconnected compliance) and security audit traceability.
End User: Prioritizes conversational responsiveness; cannot tolerate UI freezing or prolonged stuttering caused by local inference.


2.2 User Stories


| Epics | User Stories | Acceptance Criteria |
| :--- | :--- | :--- |
| **SSL Speech-to-Text** | **AS A:** End User<br>**I WANT:** To use the speech-to-text function (Multi-language)<br>**SO THAT:** I can take note of important matters more conveniently. | **Given:** The user records audio through the application.<br>**When:** The application processes the inputted information.<br>**Then:** It outputs the response in text format and stores it on the device. |
| **SSL Text-to-Speech** | **AS A:** End User<br>**I WANT:** To use the text-to-speech function (Multi-language)<br>**SO THAT:** The output can adapt to different occasions and requirements. | **Given:** The user inputs text into the application.<br>**When:** The application processes the inputted text.<br>**Then:** It outputs the response in audio format and stores it on the device. |
| **SSL Data Storage & Management** | **AS A:** End User<br>**I WANT:** The response waiting time to be within an acceptable range<br>**SO THAT:** Waiting time is reduced, increasing work efficiency. | **Given:** After the user provides a valid input to the application.<br>**When:** Between the time the application receives the message and generates the output.<br>**Then:** The system processes it in the background via a multi-threaded Pipeline, ensuring the Time to First Token (TTFT) for Text-to-Speech (TTS) synthesis does not exceed 1.5 seconds. (\*\*Actual response time depends primarily on the final product). |
| **SSL Data Storage & Management** | **AS A:** End User<br>**I WANT:** To view past notes and data at any time<br>**SO THAT:** I can avoid relying solely on my own memory to remember everything. | **Given:** If the user wants to query past records and information.<br>**When:** The user enters past data records to find a specific entry.<br>**Then:** The user can find the previously stored response content. |
| **SSL Intent Recognition** | **AS A:** End User<br>**I WANT:** The application to recognize schedules mentioned in the content<br>**SO THAT:** Schedules can be added to the calendar with a single click. | **Given:** The user wants the application to recognize and add schedules from content.<br>**When:** The application identifies that the content may contain to-do items.<br>**Then:** It prompts the user whether they want to add the potential schedule. |
| **SSL Data & Privacy Protection** | **AS A:** End User<br>**I WANT:** To set data to self-destruct after a specific time<br>**SO THAT:** Manage device storage space & protect privacy. | **Given:** The user wants data to be automatically destroyed upon expiration.<br>**When:** The user completes the automatic expiration destruction settings.<br>**Then:** Expired historical record data will be securely erased automatically by a backend schedule and cannot be recovered. |
| **SSL ASK ΑΙ** | **AS A:** End User<br>**I WANT:** To perform Ask AI actions on dialogue strings<br>**SO THAT:** Generate more ideas and insights after interacting with the AI. | **Given:** The user wants to discuss response-related content with the AI.<br>**When:** Clicking the "ASK AI" button within a note.<br>**Then:** A new window appears, allowing the user to discuss with the built-in AI. |
| **SSL Data Management** | **AS A:** End User<br>**I WANT:** To manage generated content and usage status<br>**SO THAT:** Users have full control over the application's usage. | **Given:** The user wants to manage the overall app usage and notes.<br>**When:** The user enters the Control Panel page.<br>**Then:** The dashboard displays usage stats and permits note CRUD operations. |
| **SSL Office Automation** | **AS A:** Enterprise User<br>**I WANT:** To customize automated pipeline workflows<br>**SO THAT:** I can work more efficiently and stay focused. | **Given:** The user has customized a pipeline processing workflow.<br>**When:** A valid input is given to this workflow.<br>**Then:** The user receives a customized output after pipeline processing. |
| **SSL Office Automation** | **AS A:** Enterprise User<br>**I WANT:** The application to support WebHook functionality<br>**SO THAT:** Workflows within the organization can be automated. | **Given:** The user binds the organizational system with the SSL WebHook.<br>**When:** SSL receives recorded audio and extracts a summary.<br>**Then:** It automatically emails the relevant teams OR identifies and adds it to the calendar. |
| **SSL (Local mode)** | **AS A:** End User<br>**I WANT:** To switch between online & offline modes with one click<br>**SO THAT:** I can swap modes based on different occasions and needs. | **Given:** An Online/Offline Toggle is provided on the main interface.<br>**When:** The specific toggle is switched on.<br>**Then:** The application switches to the selected mode for operation. |
| **SSL (Local mode)** | **AS A:** End User<br>**I WANT:** To use the application in an offline state<br>**SO THAT:** I can get assistance anywhere. | **Given:** The system starts in a network-disconnected environment.<br>**When:** The application automatically switches to offline mode.<br>**Then:** Operations are handled via LocalHost under offline mode. |
| **SSL (Local mode)** | **AS A:** Enterprise Executive<br>**I WANT:** Application data never to leave the device<br>**SO THAT:** Confidential or sensitive data remains protected. | **Given:** The user desires that the entire usage process does not involve the internet.<br>**When:** The user selects offline mode.<br>**Then:** Inputted and outputted data will not be automatically synchronized to the server. |

### 3. Functional Requirements
3.1 Frontend Interaction Module (Desktop UI - Tauri)
Provides voice recording, transmission, and real-time status rendering (e.g., loading spinners, streaming text output).
Responsible for digitalizing user inputs into JSON format and initiating RESTful API requests.
Provides voice recording, transmission, and real-time status rendering (e.g., loading spinners, asynchronous streaming text output).
Responsible for non-signaling transmission of user inputs and recording data through Tauri's built-in IPC mechanism (invoke calls) using strong types (TypeScript Interface) to the Tauri Core layer, ensuring 0-Network Overheads without involving local network communication.


3.2 Backend Control Plane Core (Control Plane - Spring Boot)
API Routing & Parsing: Receives and parses JSON packages transmitted from the frontend, converting them into strongly-typed Data Transfer Objects (DTOs).
Multi-threaded Stream Scheduling: Launches a Thread Pool to implement asynchronous pipelining, dynamically scheduling the STT $\rightarrow$ LLM $\rightarrow$ TTS data pipeline.
IPC Routing & Parsing: Utilizes Rust's tauri::command to listen to frontend requests and uses the serde library to automatically deserialize frontend-passed data into Rust strongly-typed structures (Struct).
Asynchronous Pipeline Scheduling (Pipelining & Stream): Relies on Rust's high-performance asynchronous runtime, Tokio Runtime, and a Thread Pool to achieve asynchronous pipeline control. It dynamically schedules and transfers binary data streams and strings of local STT $\rightarrow$ LLM $\rightarrow$ TTS across threads, utilizing Tauri window events (emit streams) for real-time feedback to the frontend UI, ensuring that the frontend main thread is neither blocked nor frozen during inference.


3.3 Local AI Atomic Components (Local AI Engines - Ollama & Whisper)
Handles Speech-to-Text (STT / Whisper) and Large Language Model inference along with streaming string output on the local machine (Localhost).
Leverages Rust's FFI (Foreign Function Interface) or community native bindings (such as whisper-rs and llama-cpp-2) to directly load and invoke local AI models for inference within the Tauri backend process.
Supports native memory passing of streaming strings and audio feature values, linking model inference results to the control plane pipeline with ultra-low latency.


3.4 Comprehensive Data Storage and Retrieval Management The system must provide complete note lifecycle and data management capabilities, including: note CRUD operations and soft deletion mechanisms; storage and deserialization of AI-generated structured data (summaries/key points/action items); classification and filtering via tags and folders; advanced keyword search across titles and content; tracking of AI interaction history for individual notes; and real-time output of system status statistics required for the dashboard.



### 4. Non-Functional Requirements
4.1 Performance & Latency
Time to First Token (TTFT): The system must optimize via multi-threaded streaming to compress the local comprehensive voice response latency to under 1.5 seconds, avoiding UI blocking and freezing brought by single-threading.
Time to First Token (TTFT): The system must implement high-concurrency thread pool management based on Rust's Tokio Async Runtime. By performing asynchronous pipelining and micro-buffering stream processing on voice feature values and text tokens locally, the comprehensive local voice response latency (from the end of recording to the TTS outputting the first token) is pressed down to under 1.5 seconds, fundamentally preventing main thread UI rendering freezes caused by heavy local AI inference loads.


4.2 Security & Compliance 
Air-Gapped Defense: The system must support environment-aware configurations (Spring Profiles). Under mandatory Air-Gapped mode, it must 100% block outbound internet connections, restricting all communications to the Loopback (127.0.0.1) virtual channel.
Air-Gapped Defense (Offline Compliance): The system must support environment-aware configurations based on compile-time or runtime environment variables (such as .env configurations or Rust cfg attributes). In mandatory Air-Gapped (physically isolated) mode, the backend process (Tauri Core) must 100% block all external network sockets (Outbound Web Sockets/HTTP connections), confining all internal data exchange and command routing strictly to the core layer's IPC (Inter-Process Communication) memory channel, achieving a physical level of 0bps Outbound Traffic to guard against confidential note and inference data leaks.



4.3 Portability & Extensibility
Frontend-backend communication must strictly rely on the agreed JSON API architecture (Interface-Driven Design), ensuring components are decoupled so that hardware models can be flexibly migrated or upgraded in the future.
Component-Driven Decoupling Design: Communication between the frontend, backend, and local AI atomic engines must strictly adhere to agreed strongly-typed structural contracts (Interface-Driven Design, aligning Rust Structs with TypeScript Interfaces). This guarantees high decoupling among the UI rendering layer, control logic layer, and underlying C++ model bindings (Whisper/Llama.cpp), enabling flexible migration, replacement, or upgrading of local hardware models and underlying embedded databases without modifying the frontend architecture in the future.


### 5. Definition of Done (DoD)
5.1 Code Quality & Code Review
The code must successfully compile with zero Compilation Errors and no severe syntax warnings.
Code must be successfully pushed to the project's Git branch and pass the team's Pull Request (PR) review to ensure readability and maintainability.


5.2 Functional Closed-Loop Verification
The frontend (Tauri) and backend control plane (Spring Boot) must successfully conduct joint RESTful API debugging.
Data transmission fields must strictly align 100% with the JSON protocol specification agreed upon by both parties.
The system must fully complete the end-to-end voice loop of "STT -> Spring Boot-> Ollama -> TTS" with zero data loss.


5.3 Non-Functional Performance Metrics
Processed through the background multi-threaded pipeline, the "Time to First Token (TTFT)" for Text-to-Speech (TTS) synthesis must not exceed 1.5 seconds in local single-machine testing.


5.4 Security Compliance Verification
When the environment configuration is set to offline mode, the system must successfully pass physical network disconnection (or local firewall blocking) experiments.
Verified by Wireshark network packet monitoring, the outbound traffic throughput of the physical network card must be 0bps; all AI inference data streams must be confined to the Loopback (127.0.0.1) virtual channel, and the backend control plane must be able to explicitly track and print out the lifecycle of local requests.


5.5 Product Delivery & Deployment
Corresponding functionalities must be capable of switching environment routes via external environment variables or dynamic configuration settings (such as Spring Profiles) without modifying any Java source code.



