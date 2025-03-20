import { exec } from "child_process";
import os from "os";

const isWindows = os.platform() === "win32";

const command = isWindows
  ? 'mklink /D components "C:\\apps\\hob\\src\\components"'
  : "ln -s ../../src/components components";

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error("Error creating symlink:", err);
    process.exit(1);
  }
  console.log("Symlink created successfully:", stdout);
});
