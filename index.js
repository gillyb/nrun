const fs = require('fs');
const spawn = require('child_process').spawn;
const terminal = require('terminal-kit').terminal;

if (!fs.existsSync('./package.json')) {
  terminal.red('\n\n  This does not seem like a node package (no package.json file in dir)\n\n');
  process.exit(1);
}

const packageFile = fs.readFileSync('./package.json');

const packageObject = JSON.parse(packageFile.toString());
const scripts = Object.keys(packageObject.scripts);
const menuOptions = scripts.map(s => terminal.str.green(s) + terminal.str.grey(' - ' + packageObject.scripts[s]));

const runScript = scriptToRun => {
  const shell = spawn('npm run ' + scripts[scriptToRun], { shell: true });
  shell.stdout.on('data', data => {
    process.stdout.write(data.toString());
  });
  shell.stderr.on('data', data => {
    process.stderr.write(data.toString());
  });
  shell.on('close', code => {
    terminal('\n\n').white.bold('Process exited with code: ' + code + '\n\n');
    process.exit(code);
  });

  process.stdin.pipe(shell.stdin);
};

terminal.hideCursor().singleColumnMenu(menuOptions, {
  selectedLeftPadding: ' > ',
  leftPadding: '   ',
  cancelable: true,
  selectedStyle: terminal.bold,
  submittedStyle: terminal.bold,
  keyBindings: {
    ENTER: 'submit',
    KP_ENTER: 'submit',
    UP: 'previous',
    K: 'previous',
    k: 'previous',
    DOWN: 'next',
    J: 'next',
    j: 'next',
    TAB: 'cycleNext',
    SHIFT_TAB: 'cyclePrevious',
    HOME: 'first',
    END: 'last',
    BACKSPACE: 'cancel',
    DELETE: 'cancel',
    ESCAPE: 'escape',
    CTRL_C: 'escapse'
  }
}, (err, response) => {

  terminal.hideCursor(false).grabInput(false);

  if (!response.selectedIndex) {
    process.exit(1);
    return;
  }

  runScript(response.selectedIndex);

});
