// Decompile bow model initialization functions that set struct fields
// @category Analysis

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionManager;
import ghidra.program.model.address.Address;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Set;

public class DecompileInit extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);
        decomp.setSimplificationStyle("decompile");

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));
        Set<String> decompiled = new HashSet<>();

        FunctionManager fm = currentProgram.getFunctionManager();

        // Functions called from bow model constructor FUN_0047be60
        // These set up the bow struct fields from UI data
        long[] targets = {
            0x0047c570,  // called from constructor
            0x0047c820,  // called from constructor
            0x0047cb00,  // called from constructor
            0x0047cea0,  // called from constructor

            // Also check functions near the velocity model that might set +0x20
            0x00478cb0,  // UI value reader (referenced in FUN_0046e660)
            0x004783a0,  // sqrt-like helper used in velocity model
            0x004784d0,  // pow-like helper used in velocity model
            0x004785c0,  // sqrt helper
            0x00478220,  // abs helper
            0x004784c0,  // pi constant helper

            // FUN_0046fd90 - the lookup table function
            0x0046fd90,

            // Functions that might update bow struct offset 0x20
            0x0046f910,
            0x0046f9a0,
            0x0046fa90,
            0x0046fafd,
        };

        out.println("=== SFA.exe Init Functions ===");
        out.println("Focus: bow struct field initialization, helpers");
        out.println();

        for (long targetAddr : targets) {
            Address addr = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(targetAddr);
            Function func = fm.getFunctionContaining(addr);

            if (func == null) continue;

            String funcKey = func.getName() + "@" + func.getEntryPoint();
            if (decompiled.contains(funcKey)) continue;
            decompiled.add(funcKey);

            DecompileResults results = decomp.decompileFunction(func, 120, monitor);
            if (results != null && results.decompileCompleted()) {
                String code = results.getDecompiledFunction().getC();
                out.println("========================================");
                out.println("FUNCTION: " + func.getName());
                out.println("ADDRESS: " + func.getEntryPoint());
                out.println("SIZE: " + func.getBody().getNumAddresses() + " bytes");
                out.println("========================================");
                out.println(code);
                out.println();
            }
        }

        out.close();
        decomp.dispose();
        println("Done!");
    }
}
