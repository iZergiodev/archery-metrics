// Dump double/float constant values at known DAT_ addresses
// @category Analysis

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.mem.Memory;

import java.io.FileWriter;
import java.io.PrintWriter;

public class DumpConstants extends GhidraScript {

    @Override
    public void run() throws Exception {
        String outputPath = getScriptArgs()[0];
        PrintWriter out = new PrintWriter(new FileWriter(outputPath));
        Memory mem = currentProgram.getMemory();

        // All DAT_ addresses found in decompiled functions
        long[] addrs = {
            0x004f2f58, // DAT_004f2f58
            0x004f5078, // DAT_004f5078
            0x004f50a0, // DAT_004f50a0
            0x004f50c0, // DAT_004f50c0
            0x004f50c8, // DAT_004f50c8
            0x004f50d0, // DAT_004f50d0
            0x004f50e0, // DAT_004f50e0
            0x004f50f0, // DAT_004f50f0
            0x004f5170, // DAT_004f5170
            0x004f7058, // DAT_004f7058
            0x004f7060, // DAT_004f7060
            0x004f7100, // DAT_004f7100
            0x004f8c50, // DAT_004f8c50
            0x004f8c58, // DAT_004f8c58
            0x004f8c80, // DAT_004f8c80
            0x004f8cc8, // DAT_004f8cc8
            0x004f8d00, // DAT_004f8d00
            0x004f8d68, // DAT_004f8d68
            0x004f8d90, // DAT_004f8d90
            0x004f8f50, // DAT_004f8f50
            0x004f8f78, // DAT_004f8f78
            0x004f8f88, // DAT_004f8f88
            0x004f8fa0, // DAT_004f8fa0
            0x004f8fb0, // DAT_004f8fb0
            0x004f8fc8, // DAT_004f8fc8
            0x004f8fe0, // DAT_004f8fe0
        };

        out.println("=== SFA.exe Constant Values ===");
        out.println();

        for (long addr : addrs) {
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(addr);
            try {
                // Read as 8 bytes (double)
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);

                // Convert to double (little-endian)
                long bits = 0;
                for (int i = 7; i >= 0; i--) {
                    bits = (bits << 8) | (bytes[i] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);

                // Also read as 4 bytes (float)
                int fbits = 0;
                for (int i = 3; i >= 0; i--) {
                    fbits = (fbits << 8) | (bytes[i] & 0xFF);
                }
                float fval = Float.intBitsToFloat(fbits);

                // Also read as int
                int ival = 0;
                for (int i = 3; i >= 0; i--) {
                    ival = (ival << 8) | (bytes[i] & 0xFF);
                }

                // Show hex bytes
                StringBuilder hexStr = new StringBuilder();
                for (int i = 0; i < 8; i++) {
                    hexStr.append(String.format("%02x ", bytes[i] & 0xFF));
                }

                out.printf("DAT_%08x: double=%-20.10f  float=%-15.6f  int=%-12d  hex=[%s]%n",
                    addr, dval, fval, ival, hexStr.toString().trim());

            } catch (Exception e) {
                out.printf("DAT_%08x: ERROR reading: %s%n", addr, e.getMessage());
            }
        }

        // Also dump the lookup tables referenced by FUN_0046fd90
        out.println();
        out.println("=== Lookup Table at DAT_004f8d90 (cam type -> efficiency for FOC) ===");
        for (int i = 0; i < 40; i++) {
            long offset = 0x004f8d90 + i * 8;
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                if (Math.abs(dval) > 1e-10 && Math.abs(dval) < 1e10) {
                    out.printf("  [%08x] +%d: %.10f%n", offset, i*8, dval);
                }
            } catch (Exception e) {}
        }

        out.println();
        out.println("=== Lookup Table at DAT_004f8d00 (cam type -> efficiency for velocity) ===");
        for (int i = 0; i < 40; i++) {
            long offset = 0x004f8d00 + i * 8;
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                if (Math.abs(dval) > 1e-10 && Math.abs(dval) < 1e10) {
                    out.printf("  [%08x] +%d: %.10f%n", offset, i*8, dval);
                }
            } catch (Exception e) {}
        }

        out.println();
        out.println("=== Lookup Table at DAT_004f8d68 (cam type -> efficiency for KE) ===");
        for (int i = 0; i < 20; i++) {
            long offset = 0x004f8d68 + i * 8;
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                if (Math.abs(dval) > 1e-10 && Math.abs(dval) < 1e10) {
                    out.printf("  [%08x] +%d: %.10f%n", offset, i*8, dval);
                }
            } catch (Exception e) {}
        }

        // Also dump more of the .rdata section for any calculation constants
        out.println();
        out.println("=== All doubles in 004f2f00-004f9000 range ===");
        for (long offset = 0x004f2f00; offset < 0x004f9000; offset += 8) {
            Address a = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(offset);
            try {
                byte[] bytes = new byte[8];
                mem.getBytes(a, bytes);
                long bits = 0;
                for (int j = 7; j >= 0; j--) {
                    bits = (bits << 8) | (bytes[j] & 0xFF);
                }
                double dval = Double.longBitsToDouble(bits);
                // Only show values that look like reasonable constants
                if (Math.abs(dval) > 0.001 && Math.abs(dval) < 100000 && !Double.isNaN(dval) && !Double.isInfinite(dval)) {
                    out.printf("  [%08x]: %.15f%n", offset, dval);
                }
            } catch (Exception e) {}
        }

        out.close();
        println("Constants dumped to: " + outputPath);
    }
}
