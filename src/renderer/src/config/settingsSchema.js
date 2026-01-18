export const SETTINGS_SCHEMA = [
  {
    category: "categories.editor",
    description: "descriptions.editor",
    items: [
      {
        path: "editor.wordCountEnabled",
        label: "settings.wordCount.label",
        description: "settings.wordCount.description",
        type: "switch"
      },
      {
        path: "editor.spellCheck",
        label: "settings.spellCheck.label",
        description: "settings.spellCheck.description",
        type: "switch"
      }
    ]
  },
  {
    category: "categories.general",
    description: "descriptions.general",
    items: [
      {
        path: "general.language",
        label: "settings.language.label",
        description: "settings.language.description",
        type: "combobox",
        placeholder: "options.selectLanguage",
        options: [
          { value: "auto", label: "options.autoSystem" },
          { value: "en", label: "options.english" },
          { value: "he", label: "options.hebrew" }
        ]
      },
      {
        path: "general.notifications",
        label: "settings.notifications.label",
        description: "settings.notifications.description",
        type: "switch",
        disabled: true
      }
    ]
  }
];