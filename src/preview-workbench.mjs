import { contrastRatio, darken, lighten, sortColors, withAlpha } from "./utils.mjs";

/** NexQL brand ribbon hues (extension defaults). */
const RIBBON_HUES = {
  blue: "#3D6FE0",
  indigo: "#6C4CD6",
  purple: "#A23BC9",
  magenta: "#E0388F",
  orange: "#F26B3A",
  amber: "#F5B23A",
};

/**
 * Nudge `color` toward readable (lighter on dark, darker on light) until it
 * reaches `min` contrast against `bg`.
 * @param {string} color
 * @param {string} bg
 * @param {number} min
 * @param {boolean} isLight
 */
function ensureContrast(color, bg, min, isLight) {
  let out = color.slice(0, 7);
  for (let i = 0; i < 40 && contrastRatio(out, bg) < min; i++) {
    out = isLight ? darken(out, 0.05) : lighten(out, 0.05);
  }
  return out;
}

/** @typedef {import('./directions/types.mjs').DirectionSpec} DirectionSpec */

/**
 * @param {DirectionSpec} direction
 * @returns {Record<string, string>}
 */
export function buildPreviewWorkbench(direction) {
  const { surfaces: s, accents: a } = direction;
  const brackets = direction.bracketColors ?? [];
  const isHc = direction.type === "hc";

  /**
   * Helper to return transparent color for standard themes, or opaque fallback for HC.
   * @param {string} hex
   * @param {number} alpha
   * @param {string} opaqueFallback
   */
  const alphaColor = (hex, alpha, opaqueFallback) => {
    if (isHc) return opaqueFallback;
    return withAlpha(hex, alpha);
  };

  const isLight = direction.type === "light" || direction.uiTheme === "vs" || direction.uiTheme === "hc-light";
  const bgEditor = s.bg0;
  const brandMin = isHc ? 7 : 4.5;
  const brand = (hex) => ensureContrast(hex, bgEditor, brandMin, isLight);
  const accent = brand(a.focus);
  const accentFg = contrastRatio(s.bg0, accent) >= contrastRatio(s.fg0, accent) ? s.bg0 : s.fg0;
  const ribbon = (hex) => (isLight ? darken(hex, 0.2) : hex);

  /** @type {Record<string, string>} */
  const colors = {
    "nexql.accent": accent,
    "nexql.accentForeground": accentFg,
    "nexql.ribbon.blue": ribbon(RIBBON_HUES.blue),
    "nexql.ribbon.indigo": ribbon(RIBBON_HUES.indigo),
    "nexql.ribbon.purple": ribbon(RIBBON_HUES.purple),
    "nexql.ribbon.magenta": ribbon(RIBBON_HUES.magenta),
    "nexql.ribbon.orange": ribbon(RIBBON_HUES.orange),
    "nexql.ribbon.amber": ribbon(RIBBON_HUES.amber),
    "nexql.mode.read": brand(a.success),
    "nexql.mode.write": brand(a.warning),
    "nexql.mode.admin": brand(a.error),
    "postgres.envProd": brand(a.error),
    "postgres.envStaging": brand(a.warning),
    "postgres.envDev": brand(a.success),
    focusBorder: a.focus,
    foreground: s.fg1,
    descriptionForeground: s.fg3,
    errorForeground: a.error,
    "icon.foreground": s.fg2,
    "sash.hoverBorder": a.focus,
    "window.activeBorder": a.focus,
    "window.inactiveBorder": s.border0,

    "titleBar.activeBackground": s.bg0,
    "titleBar.activeForeground": s.fg0,
    "titleBar.inactiveBackground": s.bg1,
    "titleBar.inactiveForeground": s.fg3,
    "titleBar.border": s.border0,

    "activityBar.background": s.bg0,
    "activityBar.foreground": a.activityBar,
    "activityBar.inactiveForeground": s.fg3,
    "activityBar.border": s.border0,
    "activityBar.activeBorder": a.focus,
    "activityBarBadge.background": a.focus,
    "activityBarBadge.foreground": s.bg0,

    "sideBar.background": s.bg1,
    "sideBar.foreground": s.fg2,
    "sideBar.border": s.border0,
    "sideBarTitle.foreground": s.fg0,
    "sideBarSectionHeader.background": s.bg2,
    "sideBarSectionHeader.foreground": s.fg1,
    "sideBarSectionHeader.border": s.border1,

    "list.activeSelectionBackground": a.listActive,
    "list.activeSelectionForeground": a.listActiveFg,
    "list.inactiveSelectionBackground": s.bg3,
    "list.inactiveSelectionForeground": s.fg1,
    "list.hoverBackground": s.bg3,
    "list.hoverForeground": s.fg0,
    "list.focusBackground": a.listActive,
    "list.focusForeground": a.listActiveFg,
    "list.focusOutline": alphaColor(a.focus, 0.5, a.focus),
    "list.focusHighlightForeground": alphaColor(a.focus, 0.75, a.focus),
    "list.highlightForeground": a.focus,
    "list.errorForeground": a.error,
    "list.warningForeground": a.warning,
    "list.filterMatchBackground": alphaColor(a.findMatch, 0.35, s.bg3),
    "list.deemphasizedForeground": s.fg3,

    "tree.indentGuidesStroke": s.border1,
    "tree.inactiveIndentGuidesStroke": s.border0,
    "tree.tableColumnsBorder": s.border1,
    "tree.tableOddRowsBackground": alphaColor(s.bg2, 0.5, s.bg2),

    "editor.background": s.bg0,
    "editor.foreground": s.fg1,
    "editorLineNumber.foreground": s.fg3,
    "editorLineNumber.activeForeground": a.cursor,
    "editorCursor.foreground": a.cursor,
    "editor.selectionBackground": a.selection,
    "editor.inactiveSelectionBackground": alphaColor(s.bg3, 0.8, s.bg3),
    "editor.selectionHighlightBackground": alphaColor(a.focus, 0.2, s.bg3),
    "editor.wordHighlightBackground": alphaColor(a.focus, 0.15, s.bg3),
    "editor.wordHighlightStrongBackground": alphaColor(a.focus, 0.25, s.bg3),
    "editor.findMatchBackground": alphaColor(a.findMatch, 0.4, s.bg3),
    "editor.findMatchHighlightBackground": alphaColor(a.focus, 0.2, s.bg3),
    "editor.lineHighlightBackground": alphaColor(s.bg1, 0.6, s.bg1),
    "editor.lineHighlightBorder": s.border0,
    "editorWhitespace.foreground": alphaColor(s.fg3, 0.35, s.fg3),
    "editorIndentGuide.background1": s.border0,
    "editorIndentGuide.activeBackground1": alphaColor(a.focus, 0.45, a.focus),
    "editorRuler.foreground": s.border0,
    "editorBracketMatch.background": alphaColor(a.focus, 0.12, s.bg3),
    "editorBracketMatch.border": a.focus,
    "editorGutter.background": s.bg0,
    "editorGutter.modifiedBackground": a.modified,
    "editorGutter.addedBackground": a.added,
    "editorGutter.deletedBackground": a.deleted,
    "editorError.foreground": a.error,
    "editorWarning.foreground": a.warning,
    "editorInfo.foreground": a.focus,
    "editorGhostText.foreground": alphaColor(s.fg3, 0.65, s.fg3),
    "editorInlayHint.foreground": s.fg3,
    "editorInlayHint.background": alphaColor(s.bg2, 0.9, s.bg2),
    "editorSuggestWidget.background": s.bg2,
    "editorSuggestWidget.border": s.border1,
    "editorSuggestWidget.foreground": s.fg1,
    "editorSuggestWidget.highlightForeground": a.focus,
    "editorSuggestWidget.selectedBackground": a.listActive,
    "editorSuggestWidget.selectedForeground": a.listActiveFg,
    "editorHoverWidget.background": s.bg2,
    "editorHoverWidget.border": s.border1,
    "editorWidget.background": s.bg2,
    "editorWidget.border": s.border1,

    "editorGroupHeader.tabsBackground": s.bg0,
    "editorGroupHeader.tabsBorder": s.border0,
    "tab.activeBackground": s.bg1,
    "tab.activeForeground": s.fg0,
    "tab.activeBorderTop": a.tabActiveTop,
    "tab.inactiveBackground": s.bg0,
    "tab.inactiveForeground": s.fg3,
    "tab.hoverBackground": s.bg2,
    "tab.border": s.border0,
    "breadcrumb.foreground": s.fg3,
    "breadcrumb.background": s.bg1,
    "breadcrumb.focusForeground": s.fg0,
    "breadcrumb.activeSelectionForeground": a.focus,

    "panel.background": s.bg2,
    "panel.border": s.border0,
    "panelTitle.activeForeground": s.fg0,
    "panelTitle.inactiveForeground": s.fg3,
    "panelTitle.activeBorder": a.focus,

    "statusBar.background": a.statusBar,
    "statusBar.foreground": a.statusBarFg,
    "statusBar.border": s.border0,
    "statusBar.debuggingBackground": a.warning,
    "statusBar.debuggingForeground": s.bg0,
    "statusBar.noFolderBackground": s.bg2,
    "statusBar.noFolderForeground": s.fg1,
    "statusBarItem.hoverBackground": alphaColor(a.focus, 0.2, s.bg3),
    "statusBarItem.remoteBackground": a.focus,
    "statusBarItem.remoteForeground": s.bg0,

    "terminal.background": s.bg0,
    "terminal.foreground": s.fg1,
    "terminal.border": s.border0,
    "terminalCursor.foreground": a.cursor,
    "terminal.selectionBackground": a.selection,
    "terminal.ansiBlack": s.bg0,
    "terminal.ansiRed": a.error,
    "terminal.ansiGreen": a.success,
    "terminal.ansiYellow": a.warning,
    "terminal.ansiBlue": a.focus,
    "terminal.ansiMagenta": a.modified,
    "terminal.ansiCyan": a.focus,
    "terminal.ansiWhite": s.fg1,
    "terminal.ansiBrightBlack": s.fg3,
    "terminal.ansiBrightRed": a.error,
    "terminal.ansiBrightGreen": a.success,
    "terminal.ansiBrightYellow": a.warning,
    "terminal.ansiBrightBlue": a.focus,
    "terminal.ansiBrightMagenta": a.modified,
    "terminal.ansiBrightCyan": a.focus,
    "terminal.ansiBrightWhite": s.fg0,

    "input.background": s.bg2,
    "input.foreground": s.fg0,
    "input.border": s.border1,
    "input.placeholderForeground": s.fg3,
    "inputOption.activeBorder": a.focus,
    "inputValidation.errorBackground": alphaColor(a.error, 0.15, s.bg2),
    "inputValidation.errorBorder": a.error,
    "inputValidation.warningBackground": alphaColor(a.warning, 0.15, s.bg2),
    "inputValidation.warningBorder": a.warning,

    "button.background": a.focus,
    "button.foreground": s.bg0,
    "button.hoverBackground": alphaColor(a.focus, 0.85, a.focus),
    "button.secondaryBackground": s.bg3,
    "button.secondaryForeground": s.fg1,
    "extensionButton.background": a.focus,
    "extensionButton.foreground": s.bg0,
    "extensionButton.hoverBackground": alphaColor(a.focus, 0.85, a.focus),
    "extensionButton.prominentBackground": a.focus,
    "extensionButton.prominentForeground": s.bg0,
    "extensionButton.prominentHoverBackground": alphaColor(a.focus, 0.85, a.focus),
    "dropdown.background": s.bg2,
    "dropdown.foreground": s.fg0,
    "dropdown.border": s.border1,

    "badge.background": s.bg3,
    "badge.foreground": s.fg1,
    "progressBar.background": a.focus,

    "scrollbarSlider.background": alphaColor(s.bg3, 0.7, s.bg3),
    "scrollbarSlider.hoverBackground": alphaColor(s.border1, 0.8, s.border1),
    "scrollbarSlider.activeBackground": alphaColor(a.focus, 0.6, a.focus),

    "peekView.border": a.focus,
    "peekViewEditor.background": s.bg1,
    "peekViewResult.background": s.bg0,
    "peekViewTitle.background": s.bg2,

    "diffEditor.insertedTextBackground": alphaColor(a.added, 0.15, s.bg1),
    "diffEditor.removedTextBackground": alphaColor(a.deleted, 0.15, s.bg1),

    "quickInput.background": s.bg2,
    "quickInput.foreground": s.fg1,
    "quickInputList.focusBackground": a.listActive,
    "quickInputList.focusForeground": a.listActiveFg,
    "quickInputList.focusIconForeground": alphaColor(a.focus, 0.75, a.focus),

    "menu.background": s.bg2,
    "menu.foreground": s.fg1,
    "menu.selectionBackground": a.listActive,
    "menu.selectionForeground": a.listActiveFg,

    textLink: a.focus,
    "textLink.activeForeground": a.focus,
    textPreformatForeground: s.fg2,
    textPreformatBackground: s.bg3,
    textCodeBlockBackground: s.bg2,

    "gitDecoration.addedResourceForeground": a.added,
    "gitDecoration.modifiedResourceForeground": a.modified,
    "gitDecoration.deletedResourceForeground": a.deleted,

    "keybindingLabel.background": s.bg3,
    "keybindingLabel.foreground": s.fg0,
    "keybindingLabel.border": s.border1,

    // Chat and AI
    "chat.background": s.bg1,
    "chat.requestBackground": s.bg0,
    "chat.requestBorder": s.border0,
    "chat.slashCommandBackground": alphaColor(a.focus, 0.2, s.bg3),
    "chat.slashCommandForeground": a.focus,
    "chat.avatarBackground": s.bg2,
    "chat.avatarForeground": s.fg1,
    "inlineChat.background": s.bg2,
    "inlineChat.border": s.border1,
    "inlineChat.shadow": alphaColor(s.bg0, 0.5, s.border0),
    "inlineChatInput.background": s.bg0,
    "inlineChatInput.border": s.border0,
    "inlineChatInput.focusBorder": a.focus,
    "inlineChatInput.placeholderForeground": s.fg3,
    "inlineChatDiff.inserted": alphaColor(a.added, 0.15, s.bg1),
    "inlineChatDiff.removed": alphaColor(a.deleted, 0.15, s.bg1),

    // SCM Graph
    "scmGraph.foreground1": a.focus,
    "scmGraph.foreground2": a.warning,
    "scmGraph.foreground3": a.error,
    "scmGraph.foreground4": a.success,
    "scmGraph.foreground5": a.modified,
    "scmGraph.historyItemBaseRefColor": a.focus,
    "scmGraph.historyItemHoverAdditionsForeground": a.added,
    "scmGraph.historyItemHoverDeletionsForeground": a.deleted,
    "scmGraph.historyItemHoverLabelForeground": s.fg0,
    "scmGraph.historyItemRefColor": a.focus,
    "scmGraph.historyItemRemoteRefColor": a.modified,

    // Radio & Gauge
    "radio.activeBackground": alphaColor(a.focus, 0.2, s.bg3),
    "radio.activeBorder": a.focus,
    "radio.activeForeground": a.focus,
    "radio.inactiveBackground": s.bg2,
    "radio.inactiveBorder": s.border1,
    "radio.inactiveForeground": s.fg2,
    "radio.inactiveHoverBackground": s.bg3,
    "gauge.errorBackground": alphaColor(a.error, 0.2, s.bg2),
    "gauge.errorForeground": a.error,
    "gauge.infoBackground": alphaColor(a.focus, 0.2, s.bg2),
    "gauge.infoForeground": a.focus,
    "gauge.warningBackground": alphaColor(a.warning, 0.2, s.bg2),
    "gauge.warningForeground": a.warning,

    // CommandCenter
    "commandCenter.background": s.bg2,
    "commandCenter.foreground": s.fg2,
    "commandCenter.border": s.border0,
    "commandCenter.activeBackground": s.bg3,
    "commandCenter.activeForeground": s.fg0,
    "commandCenter.activeBorder": a.focus,
    "commandCenter.debuggingBackground": a.warning,
    "commandCenter.inactiveForeground": s.fg3,
    "commandCenter.inactiveBorder": s.border0,

    // MultiDiff
    "multiDiffEditor.background": s.bg0,
    "multiDiffEditor.border": s.border0,
    "multiDiffEditor.headerBackground": s.bg2,

    // ProfileBadge
    "profileBadge.background": s.bg3,
    "profileBadge.foreground": s.fg1,

    // Checkbox
    "checkbox.background": s.bg2,
    "checkbox.border": s.border1,
    "checkbox.foreground": s.fg0,
    "checkbox.selectBackground": a.focus,
    "checkbox.selectBorder": a.focus,

    // Symbol Icons
    "symbolIcon.arrayForeground": direction.syntax.column,
    "symbolIcon.booleanForeground": direction.syntax.number,
    "symbolIcon.classForeground": direction.syntax.type,
    "symbolIcon.colorForeground": s.fg2,
    "symbolIcon.constantForeground": direction.syntax.constant,
    "symbolIcon.constructorForeground": direction.syntax.function,
    "symbolIcon.enumeratorForeground": direction.syntax.type,
    "symbolIcon.enumeratorMemberForeground": direction.syntax.constant,
    "symbolIcon.eventForeground": direction.syntax.function,
    "symbolIcon.fieldForeground": direction.syntax.column,
    "symbolIcon.fileForeground": s.fg1,
    "symbolIcon.folderForeground": s.fg2,
    "symbolIcon.functionForeground": direction.syntax.function,
    "symbolIcon.interfaceForeground": direction.syntax.type,
    "symbolIcon.keyForeground": direction.syntax.type,
    "symbolIcon.keywordForeground": direction.syntax.keyword,
    "symbolIcon.methodForeground": direction.syntax.function,
    "symbolIcon.moduleForeground": direction.syntax.keyword,
    "symbolIcon.namespaceForeground": direction.syntax.keyword,
    "symbolIcon.numberForeground": direction.syntax.number,
    "symbolIcon.objectForeground": direction.syntax.column,
    "symbolIcon.operatorForeground": direction.syntax.operator,
    "symbolIcon.packageForeground": direction.syntax.keyword,
    "symbolIcon.propertyForeground": direction.syntax.column,
    "symbolIcon.referenceForeground": direction.syntax.alias,
    "symbolIcon.snippetForeground": direction.syntax.alias,
    "symbolIcon.stringForeground": direction.syntax.string,
    "symbolIcon.structForeground": direction.syntax.type,
    "symbolIcon.textForeground": s.fg1,
    "symbolIcon.typeParameterForeground": direction.syntax.type,
    "symbolIcon.unitForeground": direction.syntax.number,
    "symbolIcon.variableForeground": direction.syntax.column,

    // Notifications
    "notificationCenter.border": s.border1,
    "notificationCenterHeader.background": s.bg2,
    "notificationCenterHeader.foreground": s.fg0,
    "notifications.background": s.bg2,
    "notifications.foreground": s.fg1,
    "notifications.border": s.border0,
    "notificationToast.border": s.border1,
    "notificationLink.foreground": a.focus,
    "notificationsErrorIcon.foreground": a.error,
    "notificationsWarningIcon.foreground": a.warning,
    "notificationsInfoIcon.foreground": a.focus,

    // Minimap
    "minimap.background": s.bg0,
    "minimap.findMatchHighlight": alphaColor(a.findMatch, 0.5, a.findMatch),
    "minimap.selectionHighlight": alphaColor(a.focus, 0.5, a.focus),
    "minimap.errorHighlight": a.error,
    "minimap.warningHighlight": a.warning,
    "minimapSlider.background": alphaColor(s.bg3, 0.5, s.bg3),
    "minimapSlider.hoverBackground": alphaColor(s.border1, 0.6, s.border1),
    "minimapSlider.activeBackground": alphaColor(a.focus, 0.5, a.focus),
    "minimapGutter.addedBackground": a.added,
    "minimapGutter.modifiedBackground": a.modified,
    "minimapGutter.deletedBackground": a.deleted,

    // Overview ruler
    "editorOverviewRuler.border": s.border0,
    "editorOverviewRuler.findMatchForeground": alphaColor(a.findMatch, 0.5, a.findMatch),
    "editorOverviewRuler.selectionHighlightForeground": alphaColor(a.focus, 0.4, a.focus),
    "editorOverviewRuler.wordHighlightForeground": alphaColor(a.focus, 0.4, a.focus),
    "editorOverviewRuler.bracketMatchForeground": a.focus,
    "editorOverviewRuler.modifiedForeground": a.modified,
    "editorOverviewRuler.addedForeground": a.added,
    "editorOverviewRuler.deletedForeground": a.deleted,
    "editorOverviewRuler.errorForeground": a.error,
    "editorOverviewRuler.warningForeground": a.warning,
    "editorOverviewRuler.infoForeground": a.focus,

    // Git decorations (full set)
    "gitDecoration.untrackedResourceForeground": a.added,
    "gitDecoration.ignoredResourceForeground": s.fg3,
    "gitDecoration.conflictingResourceForeground": a.error,
    "gitDecoration.stageModifiedResourceForeground": a.modified,
    "gitDecoration.stageDeletedResourceForeground": a.deleted,
    "gitDecoration.submoduleResourceForeground": a.focus,
    "gitDecoration.renamedResourceForeground": a.success,

    // Merge conflicts
    "merge.currentHeaderBackground": alphaColor(a.success, 0.4, s.bg2),
    "merge.currentContentBackground": alphaColor(a.success, 0.2, s.bg1),
    "merge.incomingHeaderBackground": alphaColor(a.focus, 0.4, s.bg2),
    "merge.incomingContentBackground": alphaColor(a.focus, 0.2, s.bg1),
    "merge.commonHeaderBackground": alphaColor(s.bg3, 0.5, s.bg2),
    "merge.commonContentBackground": alphaColor(s.bg3, 0.35, s.bg1),
    "merge.border": s.border1,
    "editorOverviewRuler.currentContentForeground": a.success,
    "editorOverviewRuler.incomingContentForeground": a.focus,
    "editorOverviewRuler.commonContentForeground": s.fg3,

    // Debug
    "debugToolBar.background": s.bg2,
    "debugToolBar.border": s.border1,
    "debugIcon.breakpointForeground": a.error,
    "debugIcon.breakpointDisabledForeground": s.fg3,
    "debugIcon.breakpointUnverifiedForeground": s.fg2,
    "debugIcon.startForeground": a.success,
    "debugIcon.pauseForeground": a.focus,
    "debugIcon.stopForeground": a.error,
    "debugIcon.disconnectForeground": a.error,
    "debugIcon.continueForeground": a.success,
    "debugIcon.stepOverForeground": a.focus,
    "debugIcon.stepIntoForeground": a.focus,
    "debugIcon.stepOutForeground": a.focus,
    "debugIcon.stepBackForeground": a.focus,
    "debugIcon.restartForeground": a.success,
    "editor.stackFrameHighlightBackground": alphaColor(a.warning, 0.2, s.bg1),
    "editor.focusedStackFrameHighlightBackground": alphaColor(a.success, 0.2, s.bg1),
    "debugExceptionWidget.background": s.bg2,
    "debugExceptionWidget.border": a.error,
    "debugConsole.infoForeground": s.fg1,
    "debugConsole.warningForeground": a.warning,
    "debugConsole.errorForeground": a.error,
    "debugConsole.sourceForeground": s.fg2,
    "debugConsoleInputIcon.foreground": a.focus,
    "debugTokenExpression.name": direction.syntax.column,
    "debugTokenExpression.value": s.fg2,
    "debugTokenExpression.string": direction.syntax.string,
    "debugTokenExpression.boolean": direction.syntax.number,
    "debugTokenExpression.number": direction.syntax.number,
    "debugTokenExpression.error": a.error,

    // Testing
    "testing.iconPassed": a.success,
    "testing.iconFailed": a.error,
    "testing.iconErrored": a.error,
    "testing.iconSkipped": s.fg3,
    "testing.iconQueued": a.warning,
    "testing.iconUnset": s.fg3,
    "testing.runAction": a.success,
    "testing.message.error.decorationForeground": a.error,
    "testing.message.info.decorationForeground": a.focus,

    // Settings editor
    "settings.headerForeground": s.fg0,
    "settings.headerBorder": s.border0,
    "settings.modifiedItemIndicator": a.modified,
    "settings.dropdownBackground": s.bg2,
    "settings.dropdownForeground": s.fg0,
    "settings.dropdownBorder": s.border1,
    "settings.checkboxBackground": s.bg2,
    "settings.checkboxForeground": s.fg0,
    "settings.checkboxBorder": s.border1,
    "settings.textInputBackground": s.bg2,
    "settings.textInputForeground": s.fg0,
    "settings.textInputBorder": s.border1,
    "settings.numberInputBackground": s.bg2,
    "settings.numberInputForeground": direction.syntax.number,
    "settings.numberInputBorder": s.border1,
    "settings.focusedRowBackground": alphaColor(s.bg3, 0.5, s.bg3),
    "settings.rowHoverBackground": alphaColor(s.bg2, 0.5, s.bg2),

    // Notebook
    "notebook.editorBackground": s.bg0,
    "notebook.cellBorderColor": s.border0,
    "notebook.cellEditorBackground": s.bg1,
    "notebook.focusedCellBorder": a.focus,
    "notebook.focusedEditorBorder": a.focus,
    "notebook.cellHoverBackground": alphaColor(s.bg1, 0.5, s.bg1),
    "notebook.focusedCellBackground": alphaColor(s.bg3, 0.4, s.bg1),
    "notebook.selectedCellBackground": alphaColor(s.bg3, 0.3, s.bg1),
    "notebook.cellStatusBarItemHoverBackground": s.bg3,
    "notebookStatusSuccessIcon.foreground": a.success,
    "notebookStatusErrorIcon.foreground": a.error,
    "notebookStatusRunningIcon.foreground": a.focus,

    // Sticky scroll
    "editorStickyScroll.background": s.bg1,
    "editorStickyScroll.border": s.border0,
    "editorStickyScrollHover.background": s.bg2,

    // Toolbar
    "toolbar.hoverBackground": alphaColor(s.bg3, 0.5, s.bg3),
    "toolbar.activeBackground": s.bg3,

    // Menubar / menu
    "menubar.selectionForeground": s.fg0,
    "menubar.selectionBackground": alphaColor(a.focus, 0.2, s.bg3),
    "menubar.selectionBorder": a.focus,
    "menu.border": s.border1,
    "menu.separatorBackground": s.border1,

    // Panel sections
    "panelSection.border": s.border0,
    "panelSectionHeader.background": s.bg2,
    "panelSectionHeader.foreground": s.fg1,
    "panelInput.border": s.border1,

    // Shadows
    "widget.shadow": alphaColor(s.bg0, 0.5, s.border0),
    "scrollbar.shadow": alphaColor(s.bg0, 0.5, s.border0),

    // Editor extras
    "editorCodeLens.foreground": s.fg3,
    "editorLink.activeForeground": a.focus,
    "editor.foldBackground": alphaColor(a.focus, 0.1, s.bg1),
    "editorLightBulb.foreground": a.warning,
    "editorLightBulbAutoFix.foreground": a.focus,
    "editor.rangeHighlightBackground": alphaColor(a.focus, 0.12, s.bg3),
    "editor.symbolHighlightBackground": alphaColor(a.findMatch, 0.2, s.bg3),
    "editorHint.foreground": s.fg2,
    "editorBracketPairGuide.background1": s.border0,
    "editorBracketPairGuide.activeBackground1": a.focus,
    "editor.snippetTabstopHighlightBackground": alphaColor(a.focus, 0.2, s.bg3),
    "editor.snippetFinalTabstopHighlightBorder": a.focus,

    // Banner
    "banner.background": s.bg2,
    "banner.foreground": s.fg1,
    "banner.iconForeground": a.focus,

    // Charts
    "charts.foreground": s.fg1,
    "charts.lines": s.border1,
    "charts.red": a.error,
    "charts.blue": a.focus,
    "charts.yellow": a.warning,
    "charts.orange": a.warning,
    "charts.green": a.success,
    "charts.purple": a.modified,

    // List extras
    "list.dropBackground": alphaColor(a.focus, 0.2, s.bg3),
    "listFilterWidget.background": s.bg2,
    "listFilterWidget.outline": a.focus,
    "listFilterWidget.noMatchesOutline": a.error,

    // Welcome / walkthrough
    "welcomePage.background": s.bg0,
    "welcomePage.tileBackground": s.bg1,
    "welcomePage.tileHoverBackground": s.bg2,
    "welcomePage.progress.background": s.bg3,
    "welcomePage.progress.foreground": a.focus,
    "walkThrough.embeddedEditorBackground": s.bg1,

    // Ports
    "ports.iconRunningProcessForeground": a.success,
  };

  // High-contrast specific keys
  if (isHc) {
    colors.contrastActiveBorder = a.focus;
    colors.contrastBorder = s.border0;
  }

  for (let i = 0; i < 6; i += 1) {
    if (brackets[i]) {
      colors[`editorBracketHighlight.foreground${i + 1}`] = brackets[i];
    }
  }

  return sortColors({ ...colors, ...direction.workbenchOverrides });
}

/** Keys every preview theme must define. */
export const PREVIEW_COLOR_KEYS = Object.freeze([
  "focusBorder",
  "foreground",
  "editor.background",
  "editor.foreground",
  "sideBar.background",
  "list.activeSelectionBackground",
  "list.activeSelectionForeground",
  "statusBar.background",
  "statusBar.foreground",
  "tab.activeBorderTop",
  "terminal.background",
  "input.background",
  "input.foreground",
]);
