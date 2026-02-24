# test2.py
from matrices import analyze_verilog

verilog_codes = [
    # Module 1
    """
    module simple_and(input a, input b, output y);
        AND and1(y, a, b);
    endmodule
    """,

    # Module 2
    """
    module simple_or(input a, input b, output y);
        OR or1(y, a, b);
    endmodule
    """,

    # Module 3
    """
    module simple_xor(input a, input b, output y);
        XOR xor1(y, a, b);
    endmodule
    """,

    # Module 4
    """
    module not_buffer_chain(input a, output z);
        wire n1, n2;
        NOT not1(n1, a);
        BUF buf1(n2, n1);
        BUF buf2(z, n2);
    endmodule
    """,

    # Module 5
    """
    module nand_not(input a, input b, output y);
        wire n1;
        NAND nand1(n1, a, b);
        NOT not1(y, n1);
    endmodule
    """,

    # Module 6
    """
    module xor_nand(input a, input b, input c, output y);
        wire n1, n2;
        XOR xor1(n1, a, b);
        NAND nand1(n2, n1, c);
        BUF buf1(y, n2);
    endmodule
    """,

    # Module 7
    """
    module simple_dff(input clk, input d, output q);
        REG r0(q, d, clk, 1'b0);
    endmodule
    """,

    # Module 8
    """
    module counter_2bit(input clk, input rst, output [1:0] q);
        REG r0(q[0], ~q[0], clk, rst);
        REG r1(q[1], q[0] ^ q[1], clk, rst);
    endmodule
    """,

    # Module 9
    """
    module and_or_chain(input a, input b, input c, output y);
        wire n1;
        AND and1(n1, a, b);
        OR or1(y, n1, c);
    endmodule
    """,

    # Module 10
    """
    module xor_chain_3(input a, input b, input c, output y);
        wire n1;
        XOR xor1(n1, a, b);
        XOR xor2(y, n1, c);
    endmodule
    """,

    # Module 11
    """
    module inverter_pair(input a, output z);
        wire n1;
        NOT not1(n1, a);
        NOT not2(z, n1);
    endmodule
    """,

    # Module 12
    """
    module buf_and_or(input a, input b, input c, output y);
        wire n1, n2;
        BUF buf1(n1, a);
        AND and1(n2, n1, b);
        OR or1(y, n2, c);
    endmodule
    """,

    # Module 13
    """
    module nor_xor(input a, input b, input c, output y);
        wire n1;
        NOR nor1(n1, a, b);
        XOR xor1(y, n1, c);
    endmodule
    """,

    # Module 14
    """
    module tri_input_and(input a, input b, input c, output y);
        wire n1;
        AND and1(n1, a, b);
        AND and2(y, n1, c);
    endmodule
    """,

    # Module 15
    """
    module complex_buf_chain(input a, output y);
        wire n1, n2, n3;
        BUF buf1(n1, a);
        BUF buf2(n2, n1);
        BUF buf3(n3, n2);
        BUF buf4(y, n3);
    endmodule
    """
]

# Analyze each module
for idx, code in enumerate(verilog_codes, 1):
    print(f"\n--- Test Module {idx} ---")
    fea, adj, buf, instances = analyze_verilog(code)

    print("\nFeature Matrix:")
    for row in fea:
        print(row)

    print("\nAdjacency Matrix:")
    for row in adj:
        print(row)

    print("\nInstances:")
    print(instances)
