// Dump additional constants from velocity and spine functions
// @category Analysis

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.mem.Memory;

import java.io.FileWriter;
import java.io.PrintWriter;

public class DumpExtraConstants extends GhidraScript {

    @Override
    public void run() throws Exception {
        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));
        Memory mem = currentProgram.getMemory();

        // Additional addresses found in the dynamic spine and velocity functions
        long[] addrs = {
            // From FUN_0047bf60 (velocity/bow efficiency model)
            0x004f9f18, 0x004f9f20, 0x004f9f28, 0x004f9f10,
            0x004f9ad8, 0x004f9ef8, 0x004f9f00, 0x004f9f08,
            0x004f9f38, 0x004f9f40,
            // From FUN_0046da20 (dynamic spine)
            0x004f9020, 0x004f9024, 0x004f9028, 0x004f902c,
            0x004f9030, 0x004f9034,
            0x004f9000, 0x004f9004, 0x004f9008, 0x004f900c,
            0x004f9010, 0x004f9014, 0x004f9018, 0x004f901c,
            0x004f8ff0, 0x004f8ff4, 0x004f8ff8, 0x004f8ffc,
            0x004f8f90, 0x004f8f70,
            0x004f8f60, 0x004f8f68, 0x004f8f58,
            0x004f8f80,
            // Additional velocity constants
            0x004f9bc8,
            // Some from the simpler calculation functions
            0x004f5018,
        };

        out.println("=== SFA.exe Additional Constants ===");
        out.println();

        for (long addr : addrs) {
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(addr);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);

                long bits = 0;
                for (int i = 7; i >= 0; i--) {
                    bits = (bits << 8) | (bytes[i] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);

                // Also try reading as 4-byte int (for the _UNK_ values which might be part of doubles)
                int ival = 0;
                for (int i = 3; i >= 0; i--) {
                    ival = (ival << 8) | (bytes[i] & 0xFF);
                }

                StringBuilder hexStr = new StringBuilder();
                for (int i = 0; i < 8; i++) {
                    hexStr.append(String.format("%02x ", bytes[i] & 0xFF));
                }

                out.printf("DAT_%08x: double=%-22.15f  int32=%-12d  hex=[%s]%n",
                    addr, dval, ival, hexStr.toString().trim());

            } catch (Exception e) {
                out.printf("DAT_%08x: ERROR: %s%n", addr, e.getMessage());
            }
        }

        // Dump the full range 004f9000-004f9050 as doubles (likely function params)
        out.println();
        out.println("=== Range 004f9000-004f9050 (FP constant arrays) ===");
        for (long offset = 0x004f9000; offset < 0x004f9050; offset += 8) {
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                StringBuilder hexStr = new StringBuilder();
                for (int i = 0; i < 8; i++) {
                    hexStr.append(String.format("%02x ", bytes[i] & 0xFF));
                }
                out.printf("  [%08x]: %.15f  hex=[%s]%n", offset, dval, hexStr.toString().trim());
            } catch (Exception e) {}
        }

        // Dump the full range 004f9e00-004fa000 (velocity model constants)
        out.println();
        out.println("=== Range 004f9e00-004fa000 (velocity model constants) ===");
        for (long offset = 0x004f9e00; offset < 0x004fa000; offset += 8) {
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                if (Math.abs(dval) > 0.0001 && Math.abs(dval) < 1e10 && !Double.isNaN(dval)) {
                    out.printf("  [%08x]: %.15f%n", offset, dval);
                }
            } catch (Exception e) {}
        }

        out.close();
        println("Constants dumped to: " + outputPath);
    }
}
