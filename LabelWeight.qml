import QtQuick

// Sets the weight of the label a WidgetButton draws. WidgetButton has no
// weight of its own and keeps its label private, so this finds the label, the
// button's only Text child, and sets the weight on it. Working on the stock
// label keeps the stock sizing, figure centering and press feedback. If a
// later WidgetButton draws its label some other way, this finds nothing and
// the label keeps its normal weight; tests/label-weight.qml catches that.
QtObject {
  id: root

  property Item button: null
  property int weight: Font.Normal

  readonly property Item label: {
    if (!button) return null
    var kids = button.children
    for (var i = 0; i < kids.length; i++) {
      if (String(kids[i]).indexOf("QQuickText") === 0) return kids[i]
    }
    return null
  }

  function apply() {
    if (label) label.font.weight = weight
  }

  onLabelChanged: apply()
  onWeightChanged: apply()
}
