# SpeakSpace-Local-Group-Repo

1. 簡介與背景 (Introduction & Background)
1.1 產品願景 (Product Vision)：闡述開發 SpeakSpace Local 的核心目的──打造一個在本地端（Localhost）運作、兼具極致低延遲體驗與企業級安全防禦的語音助理系統。
1.2 核心目標 (Key Objectives)：
實作地端「STT ➔ LLM ➔ TTS」的非同步控制面流水線。
遵循資安合規原則，確保系統具備在「物理隔離（Air-Gapped）」環境下穩定運作的能力。


2. 利益關係人與用戶故事 (Stakeholders & User Stories)
2.1 利益關係人分析 (Stakeholder Analysis)：
客戶/企業主管：看重資料絕對不外洩（1.2 斷網合規）與資安審計追溯能力。
終端用戶：看重對話響應速度，無法忍受因地端推理導致的 UI 凍結或長時間卡頓。
### 2.2 用戶故事 (User Stories - 敏捷開發核心)

| Epics | User Stories | Acceptance Criteria |
| :--- | :--- | :--- |
| **SSL Desktop** | **As a:** 一般使用者<br>**I Want:** 使用語音轉文字功能<br>**So That:** 我可以更方便的記下重要事物 | **Given:** 使用者透過應用程式錄音<br>**When:** 應用程式處理輸入的資訊後<br>**Then:** 輸出文字格式的回應內容並儲存在裝置中 |
| | **As a:** 一般使用者<br>**I Want:** 使用文字轉語音功能<br>**So That:** 輸出可以符合不同場合與需求 | **Given:** 使用者對應用程式輸入文字<br>**When:** 應用程式處理輸入的文字後<br>**Then:** 輸出音訊格式的回編內容並儲存在裝置中 |
| | **As a:** 一般使用者<br>**I Want:** 回應等待時間在可接受的範圍內<br>**So That:** 節省等待的時間增加工作效率<br><br>**As a:** 一般使用者<br>**I Want:** 可以隨時查看過往的筆記&資料<br>**So That:** 避免需要靠自己記住所有事情 | **Given:** 使用者對應用程式給定有效輸入後<br>**When:** 應用程式在接受到訊息後到產生輸出前<br>**Then:** 系統在背景透過多執行緒 Pipeline 處理，使語音合成輸出 (TTS) 的首字響應時間不超過 1.5 秒。<br><br>**Given:** 使用者若想查詢過往紀錄與資訊<br>**When:** 使用者進入過往資料紀錄尋找特定紀錄<br>**Then:** 使用者能夠找到過往已儲存的回應內容 |
| | **As a:** 一般使用者<br>**I Want:** 設定資料在特定時間後銷毀<br>**So That:** 裝置存儲空間管理 & 隱私保護 | **Given:** 使用者希望資料可以在到期後自動銷毀<br>**When:** 使用者完成到期自動銷毀相關設定<br>**Then:** 符合過期條件的歷史紀錄資料，將由後端排程自動執行安全抹除且無法被復原。 |
| | **As a:** 一般使用者<br>**I Want:** 應用程式能識別內容提及的排程<br>**So That:** 可以一鍵將行程加入行事曆 | **Given:** 使用者希望應用程式能識別內容加入排程<br>**When:** 應用程式識別到內容可能有待辦事項內容<br>**Then:** 詢問使用者是否要新增可能的排程 |
| **SSL (Local mode)** | **As a:** 企業主管<br>**I Want:** 能夠一鍵切換離線 & 線上模式<br>**So That:** 根據場合與需求更換模式 | **Given:** 主畫面設置了 Online/Offline Toggle<br>**When:** 特定的 Toggle 被打開了<br>**Then:** 應用程式切換到該選定的模式進行運作 |
| | **As a:** 一般使用者<br>**I Want:** 應用程式在離線狀態下使用<br>**So That:** 我能在任何地方取得協助 | **Given:** 系統在斷網的環境下啟動<br>**When:** 應用程式自動切換到離線模式<br>**Then:** 離線模式下轉由 LocalHost 上運作 |
| | **As a:** 企業主管<br>**I Want:** 應用程式資料不離開裝置<br>**So That:** 機密或敏感資料能得到保護 | **Given:** 使用者希望全部使用過程不經手網路<br>**When:** 使用者選擇離線模式後<br>**Then:** 輸入與輸出的資料將不自動同步至伺服器 |
| **SSL Mobile** | *(小組待補充項目)* | |

3. 功能性需求 (Functional Requirements)
3.1 前端互動模組 (Desktop UI - Tauri)：
提供語音錄製、發送與即時狀態渲染（如轉圈圈、串流文字輸出）。
負責將用戶輸入數位化為 JSON 格式，並發起 RESTful API 請求。
3.2 後端控制面核心 (Control Plane - Spring Boot)：
API 路由與解析：接收並解析前端傳入的 JSON 包裹，轉換為強型別物件（DTO）。
多執行緒串流調度：啟動線程池（Thread Pool），實作非同步管線化（Pipelining），動態調度 STT ➔ LLM ➔ TTS 資料流。
3.3 地端 AI 原子組件 (Local AI Engines - Ollama & Whisper)：
語音轉文字（STT / Whisper）與大語言模型在地端（Localhost）的推理與流式字串（Streaming）輸出。
3.4 本地資料持久化 (Data Storage - SQLite)：
利用 Spring Data JPA 實作歷史對話紀錄、資安日誌與本地 RAG 知識庫的資料儲存。


5. 非功能性需求 (Non-Functional Requirements)
4.1 效能與回應延遲 (Performance & Latency)：
首字響應時間 (TTFT)：系統必須透過多執行緒串流優化，將地端綜合語音響應延遲壓低至 1.5 秒以內，避免單執行緒帶來的 UI 阻塞與凍結。
4.2 資安與合規性 (Security & Compliance - 1.2 安全負責人防區)：
物理隔離防禦：系統必須支援環境感知設定（Spring Profiles），在強制的 Air-Gapped 模式下，100% 阻斷外網連線，限制所有通訊走 Loopback（127.0.0.1）虛擬通道。
4.3 可移植性與擴充性 (Portability & Extensibility)：
前後端通訊必須嚴格基於約定的 JSON API 架構（Interface-Driven Design），確保各組件解耦，未來可彈性遷移或升級硬體模型。


6. 驗收標準與完成定義 (Definition of Done - DoD)
5.1 程式碼品質與代碼審查 
程式碼必須成功通過編譯，無Compilation Error且無嚴重與法警告。 
必須成功推送到 Git 專案的分支（Branch），並通過團隊的 Pull Request (PR) 審查，確保代碼具備可讀性與維護性。 
5.2 功能性閉環驗證 
前端（Tauri）與後端控制面（Spring Boot）必須能順利進行 RESTful API 聯調。 
資料傳輸欄位必須 100% 嚴格符合雙方約定的 JSON 協議規格書。 
系統能完整跑完「STT ➔ Spring Boot ➔ Ollama ➔ TTS」的端到端語音閉環，無資料遺失。 
5.3 非功能性效能指標 
系統在背景透過多執行緒 Pipeline 處理，使語音合成輸出（TTS）的「首字響應時間（TTFT）」在單機測試中不得超過 1.5 秒。 
5.4資安合規性驗證 
系統在環境設定為 離線模式時，必須成功通過物理斷網（或本機防火牆阻斷）實驗。 
經由 Wireshark 網路封包監聽實測，實體網卡之外部流量吞吐量必須為 0 bps，所有 AI 推理資料流必須被鎖定在 Loopback（127.0.0.1）虛擬通道內，且後端控制面需能明確追蹤並印出本地請求之生命週期。 
5.5 產品交付與部署 
相應功能必須可以在不修改 Java 原始碼的前提下，透過外部環境變數或動態組態設定（如 Spring Profiles）進行環境路由切換。 
