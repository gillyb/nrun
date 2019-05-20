const fs = require('fs');
const spawn = require('child_process').spawn;
const terminal = require('terminal-kit').terminal;

if (!fs.existsSync('./package.json')) {
  terminal.red('\n\n  This does not seem like a node package (no package.json file in dir)\n\n');
  process.exit(1);
}

const packageFile = fs.readFileSync('./package.json');

const packageObject = JSON.parse(packageFile.toString());

if (!packageObject.scripts) {
  terminal.yellow('\n\n  This package does not have any defined scripts\n\n');
  process.exit(1);
}

const scripts = Object.keys(packageObject.scripts);
const menuOptions = scripts.map(s => terminal.str.green(s) + terminal.str.grey(' - ' + packageObject.scripts[s]));

const runScript = scriptToRun => {
  spawn('npm run ' + scripts[scriptToRun], { shell: true, stdio: 'inherit' });
};

// Check if we got an argument for a specific script to run
const args = process.argv;
if (args.length === 3) {
  if (!~scripts.indexOf(args[2])) {
    terminal.yellow('\n  The script \'' + args[2] + '\' does not exist in package.json file\n\n');
    process.exit(1);
  }

  console.log('Running script: ' + args[2]);
  runScript(scripts.indexOf(args[2]));
}
else {
  // We didn't get anything, just show the menu of options
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
      CTRL_C: 'escape'
    }
  }, (err, response) => {

    terminal.hideCursor(false).grabInput(false);

    if (response.selectedIndex === null || response.selectedIndex === undefined) {
      terminal.red('\n  Unknown Error!\n\n');
      process.exit(1);
      return;
    }

    runScript(response.selectedIndex);

  });
}