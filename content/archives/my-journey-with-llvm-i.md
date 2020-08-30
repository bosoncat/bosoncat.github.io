---
title: "My Journey with LLVM (GSoC'20 Phase 1)"
date: 2020-06-30T14:12:15+08:00
---

It has been one month since my proposal gets accepted by GSoC'20. I learned a lot and had a wonderful time. Besides, we’ve made some progress towards our goal. Hence, it’s a good time to review what I’ve done and what I’ve learned in the first coding period.

<!--more-->

### The Project

In LLVM, we use `yaml2obj` to handcraft simple binaries of various formats in YAML, e.g., ELF, Mach-O, COFF, etc. My project is to add DWARF support to `yaml2obj` which hopefully makes it easier for people to handcraft debug sections in those kinds of binaries. This project is supervised by James Henderson.

### The Progress

We’ve already ported existing DWARF implementation to `yaml2elf` as planned. People are able to handcraft DWARF sections at a low level. I have to admit that the current implementation of DWARF sections is hard to use since we have to specify nearly every field of those sections, e.g., the length, the version, the address or offset of the associated DWARF section, etc. That’s because those sections are isolated in the current implementation and DWARFYAML lacks a strategy to make those sections get interlinked properly. This is what we are going to address and I believe it will be improved in the future. We also have a [spreadsheet](https://docs.google.com/spreadsheets/d/1qo5DWkBgSZjqVL6KlTXiV0kpUObuSlse7qDwn_WoXNE/edit?usp=sharing) to record the progress against the expected timeline.

### The Implementation Status

The supported DWARF sections’ syntax and known issues are listed below. I’m not going to resolve all of the issues since some DWARF sections are deprecated in DWARFv5 spec and rarely used.

> Note: The fields quoted by "[[]]" are optional.

| Syntax     | Known Issues/Possible Improvements |
|:-----------|:-----------------------------------|
| <pre>debug_abbrev:<br>  - [[Code: 1]]<br>    Tag: DW_CHILDREN_yes<br>    Attributes:<br>      - Attribute: DW_AT_producer<br>        Form: DW_FORM_strp</pre> | * Doesn't support emitting multiple abbrev tables. [D83116](https://reviews.llvm.org/D83116) |
| <pre>debug_addr:<br>  - [[Format: DWARF32/DWARF64]]<br>    [[Length: 0x1234]]<br>    Version: 5<br>    [[AddressSize: 8]]<br>    [[SegmentSelectorSize: 0]]<br>    Entries:<br>      - Address: 0x1234<br>        [[Segment: 0x1234]]</pre> | * `yaml2macho` doesn't support emitting the `.debug_addr` section.<br> * `dwarf2yaml` doesn't support parsing the `.debug_addr` section. |
| <pre>debug_aranges:<br>  - [[Format: DWARF32/DWARF64]]<br>    Length: 0x1234<br>    CuOffset: 0x1234<br>    AddrSize: 0x08<br>    SegSize: 0x00<br>    Descriptors:<br>      - Address: 0x1234<br>        Length: 0x00</pre> | * The `Length`, `AddrSize` and `SegSize` fields should be optional.<br> * Rename `CuOffset` to `DebugInfoOffset`.<br> * Rename `AddrSize` to `AddressSize`.<br> * Rename `SegSize` to `SegmentSelectorSize`. |
| <pre>debug_info:<br>  - [[Format: DWARF32/DWARF64]]<br>    Length: 0x1234<br>    Version: 5<br>    UnitType: DW_UT_compile<br>    AbbrOffset: 0x00<br>    AddrSize: 0x08<br>    Entries:<br>      - AbbrCode: 1<br>        Values:<br>          - Value: 0x1234<br>          - BlockData: [ 0x12, 0x34 ]<br>          - CStr: 'abcd'</pre> | * Rename `AbbrOffset` to `DebugAbbrevOffset`.<br> * Rename `AddrSize` to `AddressSize`.<br> * Rename `AbbrCode` to `AbbrevCode` or `Code`. |
| <pre>debug_line:<br>  - [[Format: DWARF32/DWARF64]]<br>    Length: 0x1234<br>    Version: 4<br>    PrologueLength: 0x1234<br>    MinInstLength: 1<br>    DefaultIsStmt: 1<br>    LineBase: 251<br>    LineRange: 14<br>    OpcodeBase: 3<br>    StandardOpcodeLengths: [ 0, 1, 1 ]<br>    IncludeDirs:<br>      - a.dir<br>    Files:<br>      - Name: hello.c<br>        DirIndex: 0<br>        ModTime: 0<br>        Length: 0<br>    Opcodes:<br>      - Opcode: DW_LNS_extended_op<br>        ExtLen: 9<br>        SubOpcode: DW_LNE_set_address<br>        Data: 0x1234</pre> | * The DWARFv5 `.debug_line` section isn't tested. |
|<pre>debug_pub_names/types:<br>  Length:<br>    TotalLength: 0xffffffff<br>    TotalLength64: 0x0c<br>  Version: 2<br>  UnitOffset: 0x1234<br>  UnitSize: 0x4321<br>  Entries:<br>    DieOffset: 0x1234<br>    Name: abcd</pre> | * Doesn’t support emitting multiple pub tables.<br> * Replace `Length` with `Format` and `Length`. |
| <pre>debug_ranges:<br>  - AddrSize: 0x04<br>    Entries:<br>      - LowOffset: 0x10<br>        HighOffset: 0x20</pre> | |
| <pre>debug_str:<br>  - abc<br>  - def</pre> | |

### Accomplishments

I’m very happy that I’m roughly able to reach the goal of the first period. During the first coding period, I learned about how the debug information is represented at a lower level in object files and how to process errors in the LLVM library. I’m also able to dig into some related core libraries, such as DebugInfo, CodeGen, and so on.

### Areas in Need of Improvements

However, there are still some areas that I didn’t do well. When I was working on porting DWARF support to `yaml2elf`, I found that some DWARF sections were not well-formatted, e.g., the `.debug_pub*` sections don’t support emitting multiple pub tables, the `.debug_abbrev` section doesn’t support emitting multiple abbreviation tables, the `.debug_pub*` and `.debug_abbrev` sections lack terminating entries, etc. I used to port them to `yaml2elf` first and then try to fix the issue. However, it’s not the right approach! I should have fixed the issue first and then ported the section to `yaml2elf` so that I don’t have to update the test cases in many places and this prevents ill-formed test cases from spreading everywhere.

Besides, if I had made `elf2yaml` support converting DWARF sections back to YAML, my life would be easier. After porting some sections to `yaml2elf`, I realize that it’s good for us to have a tool that is able to convert DWARF sections back so that I don’t have to handcraft too many sections.

### Acknowledgements

I would love to express my sincere gratitude to James Henderson for mentoring me during this project, and to folks for reviewing my patches and giving many useful suggestions in my proposal!

### Accepted Patches

In case these patches are useful for evaluation.

D82435 [[DWARFYAML][debug_gnu_*] Add the missing context](https://reviews.llvm.org/D82435)

D82933 [[DWARFYAML][debug_abbrev] Emit 0 byte for terminating abbreviations.](https://reviews.llvm.org/D82933)

D82622 [[DWARFYAML][debug_info] Replace 'InitialLength' with 'Format' and 'Length'.](https://reviews.llvm.org/D82622)

D82367 [[ObjectYAML][ELF] Add support for emitting the .debug_gnu_pubnames/pubtypes sections.](https://reviews.llvm.org/D82367)

D82630 [[ObjectYAML][DWARF] Collect diagnostic message when YAMLParser fails.](https://reviews.llvm.org/D82630)

D82296 [[ObjectYAML][ELF] Add support for emitting the .debug_pubnames section.](https://reviews.llvm.org/D82296)

D82621 [[DWARFYAML][debug_info] Teach yaml2obj emit correct DWARF64 unit header.](https://reviews.llvm.org/D82621)

D82351 [[ObjectYAML][DWARF] Remove unused context. NFC.](https://reviews.llvm.org/D82351)

D82347 [[ObjectYAML][ELF] Add support for emitting the .debug_pubtypes section.](https://reviews.llvm.org/D82347)

D82275 [[DWARFYAML][debug_info] Add support for error handling.](https://reviews.llvm.org/D82275)

D82173 [[DWARFYAML][debug_info] Use 'AbbrCode' to index the abbreviation.](https://reviews.llvm.org/D82173)

D82139 [[DWARFYAML][debug_info] Fix array index out of bounds error.](https://reviews.llvm.org/D82139)

D82073 [[ObjectYAML][ELF] Add support for emitting the .debug_info section.](https://reviews.llvm.org/D82073)

D81826 [[DWARFYAML][debug_abbrev] Make the abbreviation code optional.](https://reviews.llvm.org/D81826)

D81820 [[ObjectYAML][ELF] Add support for emitting the .debug_abbrev section.](https://reviews.llvm.org/D81820)

D81915 [[ObjectYAML][DWARF] Let writeVariableSizedInteger() return Error.](https://reviews.llvm.org/D81915)

D81541 [[ObjectYAML][DWARF] Implement the .debug_addr section.](https://reviews.llvm.org/D81541)

D81709 [[ObjectYAML][DWARF] Let the target address size be inferred from FileHeader.](https://reviews.llvm.org/D81709)

D81529 [[ObjectYAML][test] Use a single test file to test the empty 'DWARF' entry.](https://reviews.llvm.org/D81529)

D80722 [[ObjectYAML][DWARF] Make the `PubSection` optional.](https://reviews.llvm.org/D80722)

D81220 [[DWARFYAML][debug_ranges] Make the "Offset" field optional.](https://reviews.llvm.org/D81220)

D81528 [[DWARFYAML] Add support for emitting DWARF64 .debug_aranges section.](https://reviews.llvm.org/D81528)

D81450 [[ObjectYAML][ELF] Add support for emitting the .debug_line section.](https://reviews.llvm.org/D81450)

D81357 [[DWARFYAML][debug_ranges] Emit an error message for invalid offset.](https://reviews.llvm.org/D81357)

D81356 [[ObjectYAML] Add support for error handling in DWARFYAML. NFC.](https://reviews.llvm.org/D81356)

D80203 [[ObjectYAML][DWARF] Add DWARF entry in ELFYAML.](https://reviews.llvm.org/D80203)

D80862 [[ObjectYAML][test] Address comments in D80203.](https://reviews.llvm.org/D80862)

D81217 [[ObjectYAML][DWARF] Support emitting .debug_ranges section in ELFYAML.](https://reviews.llvm.org/D81217)

D81063 [[DWARFYAML][debug_aranges] Replace InitialLength with Format and Length.](https://reviews.llvm.org/D81063)

D81051 [[ObjectYAML][ELF] Let the endianness of DWARF sections be inferred from FileHeader.](https://reviews.llvm.org/D81051)

D80972 [[ObjectYAML][DWARF] Support emitting the .debug_aranges section in ELFYAML.](https://reviews.llvm.org/D80972)

D80535 [[ObjectYAML][MachO] Add error handling in MachOEmitter.](https://reviews.llvm.org/D80535)
