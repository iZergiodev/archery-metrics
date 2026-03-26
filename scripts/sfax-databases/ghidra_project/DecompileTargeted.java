// Decompile specific target functions by address
// @category Analysis

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionManager;
import ghidra.program.model.address.Address;

import java.io.FileWriter;
import java.io.PrintWriter;

public class DecompileTargeted extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        FunctionManager fm = currentProgram.getFunctionManager();

        // Target addresses: calculation functions identified from call analysis
        long[] targets = {
            // Core calculation functions called from UI handlers
            0x0046d570,  // called as FUN_0046d570 - likely FOC or spine calc
            0x0046d900,  // called as FUN_0046d900 - appears to be a conversion/calc
            0x0046d980,  // called as FUN_0046d980 - appears to be velocity or energy
            0x0046d9c0,  // called as FUN_0046d9c0 - another calc
            0x0046e370,  // called as FUN_0046e370 - KE calculation?
            0x0046e540,  // called as FUN_0046e540
            0x0046e5f0,  // called as FUN_0046e5f0
            0x004783a0,  // called as FUN_004783a0 - referenced in specs calc
            0x0047bf60,  // called from arrow weight handler
            0x0047c3a0,  // called from UI handler

            // Functions in the known calculation zone (0x46C000-0x470000)
            0x0046c000, 0x0046c100, 0x0046c200, 0x0046c300, 0x0046c400,
            0x0046c500, 0x0046c600, 0x0046c700, 0x0046c800, 0x0046c900,
            0x0046ca00, 0x0046cb00, 0x0046cc00, 0x0046cd00, 0x0046ce00,
            0x0046cf00, 0x0046d000, 0x0046d100, 0x0046d200, 0x0046d300,
            0x0046d400, 0x0046d500, 0x0046d600, 0x0046d700, 0x0046d800,
            0x0046da00, 0x0046db00, 0x0046dc00, 0x0046dd00, 0x0046de00,
            0x0046df00, 0x0046e000, 0x0046e100, 0x0046e200, 0x0046e300,
            0x0046e400, 0x0046e500, 0x0046e600, 0x0046e700, 0x0046e800,
            0x0046e900, 0x0046ea00, 0x0046eb00, 0x0046ec00, 0x0046ed00,
            0x0046ee00, 0x0046ef00, 0x0046f000, 0x0046f100, 0x0046f200,
            0x0046f300, 0x0046f400, 0x0046f500,

            // Also check 0x460000-0x462700 zone (FP-heavy functions found there)
            0x0045f7b0, 0x0045fea0, 0x00460440, 0x00460af0, 0x00460e10,
            0x00461390, 0x00462150, 0x00462600,
        };

        out.println("=== SFA.exe Targeted Decompilation ===");
        out.println("Decompiling functions at and near known calculation addresses");
        out.println();

        for (long targetAddr : targets) {
            Address addr = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(targetAddr);
            Function func = fm.getFunctionContaining(addr);

            if (func == null) continue;

            // Avoid decompiling the same function twice
            String funcName = func.getName() + "@" + func.getEntryPoint();

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
