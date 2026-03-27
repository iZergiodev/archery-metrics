// Dump additional constants referenced in velocity/drag functions
// @category Analysis

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;

import java.io.FileWriter;
import java.io.PrintWriter;

public class DumpMoreConstants extends GhidraScript {

    @Override
    public void run() throws Exception {
        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));

        out.println("=== Additional Constants ===");

        // Constants from FUN_0047bf60 (buildVelocityModel)
        long[] addrs = {
            0x004f5098,  // used in adjustedVelocity calc
            0x004f8c90,  // scaledEfficiency multiplier (SFAX_SPEED_EFFICIENCY_SCALE?)
            0x004f8c78,  // decay high
            0x004f9ad8,  // decay low
            0x004f8c48,  // drawWeight micro factor
            0x004f9ef8,  // drawLength micro factor (prefixed with _)
            0x004f9f30,  // used in FUN_0047bf50 (iboVelocity / this)
            0x004f9f38,  // weight correction range lower
            0x004f9f40,  // weight correction range upper

            // Constants from FUN_0046e370 (stored drag)
            0x004f8c80,  // fletch drag coefficient?
            0x004f8fb0,  // fletch drag factor? (prefixed with _)
            0x004f8f88,  // fletch offset base? (prefixed with _)
            0x004f8f78,  // energy scale? (prefixed with _)
            0x004f8fa0,  // letoff factor? (prefixed with _)
            0x004f8f50,  // shaft aero factor? (prefixed with _)
            0x004f8fc8,  // shaft length factor? (prefixed with _)

            // FUN_0046fd90 lookup table bases
            0x004f8d00,  // velocity shaft factor table
            0x004f8d08,
            0x004f8d10,
            0x004f8d18,
            0x004f8d20,
            0x004f8d28,
            0x004f8d30,
            0x004f8d38,
            0x004f8d40,
            0x004f8d48,
            0x004f8d50,
            0x004f8d58,
            0x004f8d60,
            0x004f8d68,  // KE efficiency table
            0x004f8d70,
            0x004f8d78,
            0x004f8d80,
            0x004f8d88,
            0x004f8d90,  // FOC table
            0x004f8d98,
            0x004f8da0,
            0x004f8da8,
            0x004f8db0,

            // Dynamic spine constants from FUN_0046da20
            0x004f9000,  // A2A curve param
            0x004f9004,
            0x004f9008,
            0x004f900c,
            0x004f9010,  // finger curve param
            0x004f9014,
            0x004f9018,
            0x004f901c,
            0x004f9020,  // draw curve param
            0x004f9024,
            0x004f9028,
            0x004f902c,
            0x004f9030,  // sign flip constant
            0x004f9034,

            // More from velocity model
            0x004f8f58,  // shaft category base
            0x004f8f60,  // shaft category hunting
            0x004f8f68,  // shaft category target
            0x004f8fd0,  // front mass reference
            0x004f8fb8,  // dynamic length base (prefixed with _)
            0x004f8f98,  // sensitivity non-compound (prefixed with _)
            0x004f5040,  // finger curve multiplier
            0x004f5068,  // non-compound curve multiplier
            0x004f5018,  // zero check value (prefixed with _)

            // Additional from the velocity adjustment
            0x004f8cb0,  // dacron divisor
        };

        for (long cAddr : addrs) {
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
                out.printf("  DAT_%08x = <error>%n", cAddr);
            }
        }

        out.close();
        println("Done!");
    }
}
