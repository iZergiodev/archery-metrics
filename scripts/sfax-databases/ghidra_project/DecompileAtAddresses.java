// Ghidra script to decompile functions near known calculation addresses in SFA.exe
// @category Analysis

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressSet;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;

public class DecompileAtAddresses extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        // Known address ranges of interest (file offsets mapped to virtual addresses)
        // SFA.exe base = 0x00400000, .text starts at offset 0x1000
        // File offset 0x06C387 -> VA = 0x00400000 + 0x06C387 (approx, depends on sections)
        // But we need to check section mapping. Let's search more broadly.

        long baseAddr = currentProgram.getImageBase().getOffset();
        out.println("=== SFA.exe Decompilation Report ===");
        out.println("Image base: 0x" + Long.toHexString(baseAddr));
        out.println();

        // Strategy: decompile ALL functions and search for ones using our known constants
        // Known constants: 450240, 7000, 350, 28.0, 0.01265625, 0.02109375, 0.00421875
        // Also look for functions near our known offsets

        // First, list all functions and their sizes
        FunctionIterator funcIter = currentProgram.getFunctionManager().getFunctions(true);
        int totalFuncs = 0;
        while (funcIter.hasNext()) {
            funcIter.next();
            totalFuncs++;
        }
        out.println("Total functions found: " + totalFuncs);
        out.println();

        // Now decompile each function and search for key constants
        funcIter = currentProgram.getFunctionManager().getFunctions(true);
        int count = 0;
        int matched = 0;

        String[] keyPatterns = {
            "450240", "0.01265625", "0.02109375", "0.00421875",
            "7000", "28.0", "0.285", "0.005", "0.15",
            "2.75", "10.5", "20.75", "1.25",
            "0.35", "0.45", "0.55", "0.65", "0.75",
            "spine", "Spine", "SPINE",
            "velocity", "Velocity",
            "dynamic", "Dynamic",
            "arrow", "Arrow",
            "deflect", "Deflect"
        };

        while (funcIter.hasNext()) {
            Function func = funcIter.next();
            count++;

            if (count % 500 == 0) {
                monitor.setMessage("Decompiling function " + count + "/" + totalFuncs);
            }

            if (monitor.isCancelled()) {
                break;
            }

            DecompileResults results = decomp.decompileFunction(func, 30, monitor);

            if (results != null && results.decompileCompleted()) {
                String code = results.getDecompiledFunction().getC();

                // Check if this function contains any of our key patterns
                boolean isInteresting = false;
                for (String pattern : keyPatterns) {
                    if (code.contains(pattern)) {
                        isInteresting = true;
                        break;
                    }
                }

                if (isInteresting) {
                    matched++;
                    out.println("========================================");
                    out.println("FUNCTION: " + func.getName());
                    out.println("ADDRESS: " + func.getEntryPoint());
                    out.println("SIZE: " + func.getBody().getNumAddresses() + " bytes");
                    out.println("========================================");
                    out.println(code);
                    out.println();
                }
            }
        }

        out.println("========================================");
        out.println("SUMMARY: Decompiled " + count + " functions, " + matched + " matched key patterns");
        out.println("========================================");

        out.close();
        decomp.dispose();

        println("Done! Output written to: " + outputPath);
        println("Decompiled " + count + " functions, " + matched + " contained key patterns");
    }
}
