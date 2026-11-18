// Checks LabelWeight against the WidgetButton of the installed Omarchy shell.
// tests/run lays this out like tools/render-screenshots does, with Omarchy's
// Commons and Ui beside it and the repository as "plugin".
import QtQuick
import Quickshell
import qs.Commons
import qs.Ui
import "plugin"

ShellRoot {
  id: shell

  property int failures: 0

  property Item button: WidgetButton {
    text: "Wed 18 Nov 10:48"
  }

  property LabelWeight labelWeight: LabelWeight {
    button: shell.button
  }

  function check(ok, what) {
    console.log((ok ? "ok: " : "FAIL: ") + what)
    if (!ok) failures++
  }

  Component.onCompleted: {
    var regular = button.implicitWidth
    check(labelWeight.label !== null, "finds the label WidgetButton draws")
    check(labelWeight.label !== null && labelWeight.label.text === button.text, "the label is the one showing the button's text")
    labelWeight.weight = Font.DemiBold
    check(labelWeight.label !== null && labelWeight.label.font.weight === Font.DemiBold, "sets the label's weight")
    check(button.implicitWidth > regular, "the button widens to fit the heavier label")
    labelWeight.weight = Font.Normal
    check(button.implicitWidth === regular, "turning it off gives the normal width back")
    console.log(failures === 0 ? "LABEL WEIGHT PASS" : "LABEL WEIGHT FAILED")
    Qt.quit()
  }
}
