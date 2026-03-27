// Decompile velocity model, drag, and FPS computation functions
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

public class DecompileVelocity extends GhidraScript {

    @Override
    public void run() throws Exception {
        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);
        decomp.setSimplificationStyle("decompile");

        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        FunctionManager fm = currentProgram.getFunctionManager();
        Set<String> decompiled = new HashSet<>();

        long[] velocityTargets = {
            // Velocity model chain
            0x0047bf60,  // buildVelocityModel (1084 bytes)
            0x0047c410,  // velocityAdjustment (206 bytes)
            0x0047c4e0,  // dragBundle (91 bytes)
            0x0046e540,  // final FPS computation (163 bytes)

            // Nearby velocity-related helpers
            0x0047be60,
            0x0047bf50,
            0x0047c3a0,
            0x0047c3d0,

            // FPS neighbors
            0x0046e370,
            0x0046e5f0,
            0x0046e660,

            // Spine / drag / energy zone
            0x0046d4d0,
            0x0046d570,
            0x0046d730,
            0x0046d890,
            0x0046d900,
            0x0046d980,
            0x0046d9c0,
            0x0046da20,  // large spine calc (2378 bytes)
            0x0046ca90,
            0x0046cdb0,
            0x0046d3e0,

            // Energy / stored drag / KE
            0x0046eb20,
            0x0046ed20,
            0x0046eec0,
            0x0046f3c0,
            0x0046f910,
            0x0046f9a0,
            0x0046fa90,
            0x0046fafd,
            0x0046fd90,

            // UI data init (struct offset mapping)
            0x0046e750,
        };

        out.println("=== SFA.exe Velocity/Drag Decompilation ===");
        out.println("Focus: FPS model, drag, stored energy, weight correction");
        out.println();

        for (long targetAddr : velocityTargets) {
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

        // Dump key velocity constants
        out.println("========================================");
        out.println("KEY VELOCITY CONSTANTS (resolved)");
        out.println("========================================");
        long[] constAddrs = {
            0x004f7100, 0x004f50a0, 0x004f7048, 0x004f5130, 0x004f70e8,
            0x004f9f00, 0x004f9f08, 0x004f5190, 0x004f8fe0, 0x004f2f58,
            0x004f50c0, 0x004f50c8, 0x004f50d0, 0x004f50e0, 0x004f5170,
            0x004f5078, 0x004f7058, 0x004f7060, 0x004f9bc8, 0x004f9f10,
            0x004f9f18, 0x004f9f20, 0x004f9f28, 0x004f8f70, 0x004f8f80,
            0x004f8f90, 0x004f8ff0, 0x004f8ff8, 0x004f50a8, 0x004f50b0,
            0x004f50b8, 0x004f50d8, 0x004f50e8, 0x004f50f0, 0x004f50f8,
            0x004f5100, 0x004f5108, 0x004f5110, 0x004f5118, 0x004f5120,
            0x004f5128, 0x004f5138, 0x004f5140, 0x004f5148, 0x004f5150,
            0x004f5158, 0x004f5160, 0x004f5168, 0x004f5178, 0x004f5180,
            0x004f5188, 0x004f5198, 0x004f51a0, 0x004f51a8, 0x004f7068,
            0x004f7070, 0x004f7078, 0x004f7080, 0x004f7088, 0x004f7090,
            0x004f7098, 0x004f70a0, 0x004f70a8, 0x004f70b0, 0x004f70b8,
            0x004f70c0, 0x004f70c8, 0x004f70d0, 0x004f70d8, 0x004f70e0,
            0x004f70f0, 0x004f70f8, 0x004f7108, 0x004f7110,
        };

        for (long cAddr : constAddrs) {
            Address constAddr = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(cAddr);
            try {
                byte[] bytes = new byte[8];
                currentProgram.getMemory().getBytes(constAddr, bytes);
                long bits = 0;
                for (int i = 7; i >= 0; i--) {
                    bits = (bits << 8) | (bytes[i] & 0xFF);
                }
                double value = Double.longBitsToDouble(bits);
                out.printf("  DAT_%08x = %.15g%n", cAddr, value);
            } catch (Exception e) {
                out.printf("  DAT_%08x = <error reading>%n", cAddr);
            }
        }

        out.close();
        decomp.dispose();
        println("Done! Written to: " + outputPath);
    }
}
