// Ghidra script to decompile ALL functions that do floating-point math
// @category Analysis

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;

public class DecompileAll extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        out.println("=== SFA.exe Full Decompilation - Float-Heavy Functions ===");
        out.println();

        FunctionIterator funcIter = currentProgram.getFunctionManager().getFunctions(true);
        int count = 0;
        int matched = 0;

        while (funcIter.hasNext()) {
            Function func = funcIter.next();
            count++;

            if (count % 500 == 0) {
                monitor.setMessage("Decompiling function " + count);
            }

            if (monitor.isCancelled()) break;

            // Focus on functions in the main code section (0x401000 - 0x4F0000)
            long addr = func.getEntryPoint().getOffset();
            if (addr < 0x401000 || addr > 0x500000) continue;

            DecompileResults results = decomp.decompileFunction(func, 30, monitor);

            if (results != null && results.decompileCompleted()) {
                String code = results.getDecompiledFunction().getC();

                // Count floating point operations as indicator of calculation functions
                int floatOps = 0;
                int idx = 0;
                while ((idx = code.indexOf("float10", idx)) != -1) { floatOps++; idx++; }
                idx = 0;
                while ((idx = code.indexOf("double", idx)) != -1) { floatOps++; idx++; }

                // Look for functions with significant FP computation (>10 FP references)
                // OR functions that reference key DAT_ constants
                boolean hasKeyData = code.contains("DAT_004f") || code.contains("DAT_004e");
                boolean hasDivMul = code.contains(" / ") && code.contains(" * ");

                if ((floatOps > 10 && hasDivMul) || hasKeyData) {
                    matched++;
                    out.println("========================================");
                    out.println("FUNCTION: " + func.getName());
                    out.println("ADDRESS: " + func.getEntryPoint());
                    out.println("SIZE: " + func.getBody().getNumAddresses() + " bytes");
                    out.println("FLOAT_OPS: " + floatOps);
                    out.println("========================================");
                    out.println(code);
                    out.println();
                }
            }
        }

        out.println("========================================");
        out.println("SUMMARY: Scanned " + count + ", matched " + matched);
        out.println("========================================");

        out.close();
        decomp.dispose();

        println("Done! " + count + " scanned, " + matched + " FP-heavy functions written to: " + outputPath);
    }
}
