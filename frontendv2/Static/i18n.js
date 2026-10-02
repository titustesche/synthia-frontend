export const Languages = ["en", "de"];

export const TranslationKeys = {
    "en": {
        // Icon / accessibility labels
        "create": "Create",                                     // Label for the plus/create icon
        "settings": "Settings",                                 // Label for the gear icon, also the settings modal title
        "developer_settings": "Developer Settings",              // Label for the developer settings icon and settings page
        "eye_open": "Eye Open",                                 // Label for the icon that reveals a censored input
        "eye_closed": "Eye Closed",                             // Label for the icon that hides a censored input
        "server": "Server",                                     // Label for the server icon (provider settings)
        "trashcan": "Trashcan",                                 // Label for the delete/remove icon
        "dotted_menu": "Dotted Menu",                           // Label for the three-dot context menu icon
        "login": "Login",                                       // Text of the submit button in the login modal

        // Page shell (Pages/index.html)
        "page_title": "Synthia",                                // Browser tab title of the chat page
        "header_title": "Header",                               // Title text shown in the page header
        "sidebar_title": "Conversations",                        // Title text above the conversation list in the sidebar
        "accent_color_picker": "Accent Color",                   // Label for the accent color picker in the header

        // Prompt input
        "prompt_placeholder": "Type your message here...",       // Placeholder of the prompt textarea
        "select_model": "Select Model",                          // Button that opens the model selection, also its modal title
        "send": "Send",                                          // Button that sends the current prompt
        "model_placeholder": "Model",                            // Placeholder of the model search input in the model select
        "prompt_empty_error": "Prompt cannot be empty",          // Error when trying to send an empty prompt
        "no_model_selected_error": "No model selected",           // Error when trying to send without a selected model
        "could_not_send_message": "Could not send message",       // Popup title when sending a message failed

        // Sidebar
        "new_conversation": "New Conversation",                   // Button that starts a new conversation
        "conversation_name_placeholder": "Conversation Name",     // Placeholder of the new conversation name input
        "no_conversations_found": "No conversations found",       // Info text shown when the conversation list is empty
        "generated_conversation": "Generated Conversation",       // Default name for an automatically created conversation

        // Conversation context menu
        "delete": "Delete",                                       // Context menu item that deletes a conversation
        "rename": "Rename",                                       // Context menu item that renames a conversation
        "deleting_failed": "Deleting failed",                      // Popup title when deleting a conversation failed
        "could_not_create_conversation": "Could not create conversation", // Popup title when creating a conversation failed
        "could_not_find_conversation": "Could not find conversation",     // Popup title when an incoming message has no matching conversation
        "could_not_parse_conversation": "Could not parse conversation",   // Debug popup title when conversation data is malformed
        "could_not_fetch_messages": "Could not fetch messages",    // Debug popup title when loading messages failed
        "conversation_does_not_exist": "Conversation does not exist",     // Error when activating an unknown conversation
        "conversation_undefined": "Conversation Object was undefined",    // Debug popup message for a missing conversation object

        // Login / user
        "email_placeholder": "Email Address",                      // Placeholder of the email input in the login modal
        "password_placeholder": "Password",                        // Placeholder of the password input in the login modal
        "login_modal_title": "You need to log in",                 // Title of the login modal
        "not_logged_in": "Not logged in",                          // Popup title shown when the user is not authenticated
        "not_logged_in_message": "You need to login first to access this page", // Popup body shown when the user is not authenticated
        "invalid_credentials": "Invalid Credentials",              // Popup title when email or password is missing/invalid
        "invalid_credentials_message": "Please enter valid Email and Password", // Popup body when email or password is missing/invalid
        "login_error": "Error while logging in",                   // Debug popup title when the login request failed

        // Connection
        "could_not_connect_to_backend": "Could not connect to backend",   // Title of the blocking modal shown when startup fails
        "http_ok": "HTTP: OK",                                     // Status line when the HTTP backend is reachable
        "http_unreachable": "HTTP: Unreachable",                   // Status line when the HTTP backend is unreachable
        "ws_ok": "WS: OK",                                         // Status line when the WebSocket is connected
        "ws_disconnected": "WS: Disconnected",                      // Status line when the WebSocket is disconnected
        "connected": "Connected",                                   // Popup title of a successful connection check
        "unreachable": "Unreachable",                               // Popup title of a failed connection check
        "backend_reachable": "Backend is reachable",                // Popup body of a successful HTTP check
        "backend_unreachable": "Backend is unreachable",            // Popup body of a failed HTTP check
        "websocket_reachable": "WebSocket is reachable",            // Popup body of a successful WebSocket check
        "websocket_unreachable": "WebSocket is unreachable",        // Popup body of a failed WebSocket check
        "initialization_failed": "Initialization failed",           // Debug popup title when app initialization failed
        "server_response_malformed": "Server response malformed",   // Error when the server answer cannot be interpreted

        // Settings modal
        "general_settings": "General Settings",                    // Name of the general settings page in the sidebar
        "general": "General",                                      // Title of the general settings page
        "provider_settings": "Provider Settings",                   // Name of the provider settings page in the sidebar
        "providers": "Providers",                                   // Title of the provider settings page
        "developer": "Developer",                                   // Title of the developer settings page
        "username": "Username",                                     // Label and placeholder of the username input
        "provider_placeholder": "Provider",                          // Placeholder of the provider select input
        "last_ping": "Last Ping",                                    // Label of the displayed WebSocket ping value
        "check_backend_availability": "Check Backend Availability",   // Button that tests the backend connection
        "request_notification": "Request Notification",              // Button that requests a test notification
        "save_settings": "Save settings",                            // Button that stores the settings
        "cancel": "Cancel",                                          // Button that closes a modal without saving
        "success": "Success",                                         // Popup title of a successful operation
        "providers_added": "New providers have been added to database", // Popup body after providers were saved
        "could_not_add_providers": "Could not add providers",         // Popup title when saving providers failed

        // Provider select
        "add_provider": "Add Provider",                               // Button that adds another provider row
        "remove": "Remove",                                            // Button that removes a provider row
        "provider_name_placeholder": "Provider Name",                  // Placeholder of the provider name input
        "provider_url_placeholder": "http://localhost",                 // Placeholder of the provider URL input
        "provider_port_placeholder": "11434",                          // Placeholder of the provider port input
        "provider_token_placeholder": "Token",                          // Placeholder of the provider API token input
        "provider_list_endpoint_placeholder": "api/tags",               // Placeholder of the model list endpoint input
        "provider_chat_endpoint_placeholder": "api/chat",               // Placeholder of the chat endpoint input

        // Misc
        "placeholder": "Placeholder",                                   // Fallback text of a censored input without placeholder
        "debug": "Debug",                                               // Generic debug popup title
        "light_error": "Light error",                                    // Debug popup title for non critical UI errors
        "accent_color_missing": "Could not determine accent color picker", // Debug popup body when the color picker is missing
        "invalid_language": "Invalid language",                          // Popup title when an unsupported language was selected
        "language_not_supported": "Language is not supported",           // Popup body when an unsupported language was selected
        "thinking": "Thinking..."
    },
    "de": {
        // Icon- / Bedienelement-Bezeichnungen
        "create": "Erstellen",
        "settings": "Einstellungen",
        "developer_settings": "Entwicklereinstellungen",
        "eye_open": "Auge offen",
        "eye_closed": "Auge geschlossen",
        "server": "Server",
        "trashcan": "Mülleimer",
        "dotted_menu": "Punktmenü",
        "login": "Anmelden",

        // Seitenrahmen
        "page_title": "Synthia",
        "header_title": "Kopfzeile",
        "sidebar_title": "Unterhaltungen",
        "accent_color_picker": "Akzentfarbe",

        // Eingabefeld
        "prompt_placeholder": "Schreibe hier deine Nachricht...",
        "select_model": "Modell auswählen",
        "send": "Senden",
        "model_placeholder": "Modell",
        "prompt_empty_error": "Die Eingabe darf nicht leer sein",
        "no_model_selected_error": "Kein Modell ausgewählt",
        "could_not_send_message": "Nachricht konnte nicht gesendet werden",

        // Seitenleiste
        "new_conversation": "Neue Unterhaltung",
        "conversation_name_placeholder": "Name der Unterhaltung",
        "no_conversations_found": "Keine Unterhaltungen gefunden",
        "generated_conversation": "Generierte Unterhaltung",

        // Kontextmenü
        "delete": "Löschen",
        "rename": "Umbenennen",
        "deleting_failed": "Löschen fehlgeschlagen",
        "could_not_create_conversation": "Unterhaltung konnte nicht erstellt werden",
        "could_not_find_conversation": "Unterhaltung konnte nicht gefunden werden",
        "could_not_parse_conversation": "Unterhaltung konnte nicht gelesen werden",
        "could_not_fetch_messages": "Nachrichten konnten nicht geladen werden",
        "conversation_does_not_exist": "Unterhaltung existiert nicht",
        "conversation_undefined": "Unterhaltungsobjekt war undefiniert",

        // Anmeldung
        "email_placeholder": "E-Mail-Adresse",
        "password_placeholder": "Passwort",
        "login_modal_title": "Du musst dich anmelden",
        "not_logged_in": "Nicht angemeldet",
        "not_logged_in_message": "Du musst dich zuerst anmelden, um diese Seite zu nutzen",
        "invalid_credentials": "Ungültige Anmeldedaten",
        "invalid_credentials_message": "Bitte gültige E-Mail-Adresse und Passwort eingeben",
        "login_error": "Fehler bei der Anmeldung",

        // Verbindung
        "could_not_connect_to_backend": "Keine Verbindung zum Backend",
        "http_ok": "HTTP: OK",
        "http_unreachable": "HTTP: Nicht erreichbar",
        "ws_ok": "WS: OK",
        "ws_disconnected": "WS: Getrennt",
        "connected": "Verbunden",
        "unreachable": "Nicht erreichbar",
        "backend_reachable": "Backend ist erreichbar",
        "backend_unreachable": "Backend ist nicht erreichbar",
        "websocket_reachable": "WebSocket ist erreichbar",
        "websocket_unreachable": "WebSocket ist nicht erreichbar",
        "initialization_failed": "Initialisierung fehlgeschlagen",
        "server_response_malformed": "Serverantwort ist fehlerhaft",

        // Einstellungen
        "general_settings": "Allgemeine Einstellungen",
        "general": "Allgemein",
        "provider_settings": "Anbietereinstellungen",
        "providers": "Anbieter",
        "developer": "Entwickler",
        "username": "Benutzername",
        "provider_placeholder": "Anbieter",
        "last_ping": "Letzter Ping",
        "check_backend_availability": "Backend-Verfügbarkeit prüfen",
        "request_notification": "Benachrichtigung anfordern",
        "save_settings": "Einstellungen speichern",
        "cancel": "Abbrechen",
        "success": "Erfolg",
        "providers_added": "Neue Anbieter wurden in der Datenbank gespeichert",
        "could_not_add_providers": "Anbieter konnten nicht hinzugefügt werden",

        // Anbieterauswahl
        "add_provider": "Anbieter hinzufügen",
        "remove": "Entfernen",
        "provider_name_placeholder": "Anbietername",
        "provider_url_placeholder": "http://localhost",
        "provider_port_placeholder": "11434",
        "provider_token_placeholder": "Token",
        "provider_list_endpoint_placeholder": "api/tags",
        "provider_chat_endpoint_placeholder": "api/chat",

        // Sonstiges
        "placeholder": "Platzhalter",
        "debug": "Debug",
        "light_error": "Kleiner Fehler",
        "accent_color_missing": "Akzentfarbwähler konnte nicht gefunden werden",
        "invalid_language": "Ungültige Sprache",
        "language_not_supported": "Sprache wird nicht unterstützt",
        "thinking": "Nachdenken..."
    }
}

export let Translations = TranslationKeys.en;

export function setTranslations(language) {
    Translations = TranslationKeys[language] ?? TranslationKeys.en;
}
