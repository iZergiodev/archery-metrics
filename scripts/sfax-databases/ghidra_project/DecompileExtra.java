// Decompile additional helper functions
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

public class DecompileExtra extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        FunctionManager fm = currentProgram.getFunctionManager();
        HashSet<String> done = new HashSet<>();

        long[] targets = {
            0x0046fd90,  // lookup table function (cam type -> constant)
            0x0047c410,  // velocity sub-function from FUN_0046e540
            0x0047c4e0,  // another velocity sub-function
            0x004784d0,  // FUN_004784d0 - from KE calc
            0x004784c0,  // FUN_004784c0 - from velocity calc
            0x0047c3a0,  // from UI handler
            0x004782e0,  // FUN_004782e0 - rounding helper?
            // Also the dynamic spine function area
            0x0046da00,  // look for spine calc
            0x0046db00,
            0x0046dc00,
            0x0046dd00,
            0x0046de00,
            0x0046df00,
            0x0046e000,
            0x0046e100,
            0x0046e200,
            0x0046e300,
            // And let's check what calls our known functions
            0x0046e650,  // right after FUN_0046e5f0
            0x0046e700,
            0x0046e800,
            0x0046e900,
            0x0046ea00,
            0x0046eb00,
            0x0046ec00,
            0x0046ed00,
        };

        out.println("=== SFA.exe Extra Decompilation ===");
        out.println();

        for (long targetAddr : targets) {
            Address addr = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(targetAddr);
            Function func = fm.getFunctionContaining(addr);
            if (func == null) continue;

            String key = func.getEntryPoint().toString();
            if (done.contains(key)) continue;
            done.add(key);

            DecompileResults results = decomp.decompileFunction(func, 60, monitor);
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
        println("Done! Written to: " + outputPath);
    }
}
