from matrices import analyze_verilog

verilog_codes = [
    # Module 1
    """
    module balanced_logic(input clk, input [3:0] d, output q);
        wire n1,n2,n3,n4;
        NAND nand1(n1, d[0], d[1]);
        NAND nand2(n2, d[2], d[3]);
        NAND nand3(n3, n1, n2);
        NOT not1(n4, n3);
        REG r0(q, n4, clk, 1'b0);
    endmodule
    """,

    # Module 2
    """
    module simple_add(input [1:0] x, input [1:0] y, output [1:0] s);
        XOR xor1(s[0], x[0], y[0]);
        XOR xor2(s[1], x[1], y[1]);
    endmodule
    """,

    # Module 3
    """
    module control_logic(input clk, input rst, input a, input b, output f);
        wire n1, n2;
        AND and1(n1, a, b);
        OR  or1(n2, a, b);
        NOT not1(f, n1);
    endmodule
    """,

    # Module 4
    """
    module mux2to1(input sel, input d0, input d1, output y);
        wire n1, n2, n3;
        AND and1(n1, d0, ~sel);
        AND and2(n2, d1, sel);
        OR  or1(y, n1, n2);
    endmodule
    """,

    # Module 5
    """
    module dff(input clk, input d, output q);
        REG r0(q, d, clk, 1'b0);
    endmodule
    """,

    # Module 6
    """
    module parity_checker(input [3:0] a, output p);
        wire n1, n2, n3;
        XOR xor1(n1, a[0], a[1]);
        XOR xor2(n2, a[2], a[3]);
        XOR xor3(p, n1, n2);
    endmodule
    """,

    # Module 7
    """
    module half_adder(input a, input b, output sum, output carry);
        XOR xor1(sum, a, b);
        AND and1(carry, a, b);
    endmodule
    """,

    # Module 8
    """
    module full_adder(input a, input b, input cin, output sum, output cout);
        wire n1, n2, n3;
        XOR xor1(n1, a, b);
        XOR xor2(sum, n1, cin);
        AND and1(n2, a, b);
        AND and2(n3, n1, cin);
        OR  or1(cout, n2, n3);
    endmodule
    """,

    # Module 9
    """
    module inverter_chain(input a, output z);
        wire n1, n2, n3;
        NOT not1(n1, a);
        NOT not2(n2, n1);
        NOT not3(z, n2);
    endmodule
    """,

    # Module 10
    """
    module simple_buffer(input a, output y);
        BUF buf1(y, a);
    endmodule
    """,

    # Module 11
    """
    module and_chain(input a, input b, input c, output y);
        wire n1, n2;
        AND and1(n1, a, b);
        AND and2(y, n1, c);
    endmodule
    """,

    # Module 12
    """
    module or_chain(input a, input b, input c, output y);
        wire n1, n2;
        OR or1(n1, a, b);
        OR or2(y, n1, c);
    endmodule
    """,

    # Module 13
    """
    module xor_chain(input a, input b, input c, output y);
        wire n1, n2;
        XOR xor1(n1, a, b);
        XOR xor2(y, n1, c);
    endmodule
    """,

    # Module 14
    """
    module nand_chain(input a, input b, input c, output y);
        wire n1, n2;
        NAND nand1(n1, a, b);
        NAND nand2(y, n1, c);
    endmodule
    """,

    # Module 15
    """
    module nor_chain(input a, input b, input c, output y);
        wire n1, n2;
        NOR nor1(n1, a, b);
        NOR nor2(y, n1, c);
    endmodule
    """
]

# Analyze each module
for idx, code in enumerate(verilog_codes, 1):
    print(f"\n--- Module {idx} ---")
    fea, adj, buf, instances = analyze_verilog(code)

    print("\nFeature Matrix:")
    for row in fea:
        print(row)

    print("\nAdjacency Matrix:")
    for row in adj:
        print(row)

    print("\nInstances:")
    print(instances)
