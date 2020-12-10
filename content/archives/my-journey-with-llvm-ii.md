---
title: "My Journey with LLVM (GSoC'20 Phase 2)"
date: 2020-07-30T15:31:21+08:00
tags: ["GSoC", "LLVM"]
---

During the second coding period, we’ve implemented the `.debug_str_offsets`, `.debug_rnglists` and `.debug_loclists` section. We’re able to handcraft these 3 sections via the following syntax.
<!--more-->

| Section | Syntax |
|:--------|:-------|
| debug_str_offsets | <pre>debug_str_offsets:<br>  - Format:  DWARF32 ## Optional<br>    Length:  0x1234  ## Optional<br>    Version: 5       ## Optional<br>    Padding: 0x00    ## Optional<br>    Offsets: [ 0x01, 0x02, 0x03 ]</pre> |
| debug_rnglists | <pre>debug_rnglists:<br>  - Format:              DWARF32        ## Optional<br>    Length:              0x1234         ## Optional<br>    Version:             5              ## Optional<br>    AddressSize:         0x08           ## Optional<br>    SegmentSelectorSize: 0x00           ## Optional<br>    OffsetEntryCount:    2              ## Optional<br>    Offsets:             [ 0x01, 0x02 ] ## Optional<br>    Lists:<br>      - Entries:<br>          - Operator: DW_RLE_blah<br>            Values:  [ 0x01, 0x02 ]</pre> |
| debug_loclists<br><br> Note: The .debug_loclists section is implemented, but it hasn’t been landed yet. | <pre>debug_loclists:<br>  - Format:              DWARF32 ## Optional<br>    Length:              0x1234  ## Optional<br>    Version:             5       ## Optional<br>    AddressSize:         8       ## Optional<br>    SegmentSelectorSize: 0       ## Optional<br>    OffsetEntryCount:    1       ## Optional<br>    Offsets:             [ 1 ]   ## Optional<br>    Lists:<br>      - Entries:<br>          - Operator:          DW_LLE_blah<br>            Values:            [ 0x1234, 0x4321 ]<br>            DescriptorsLength: 0x1234   ## Optional<br>            Descriptors:<br>              - Operator: DW_OP_blah<br>                Values:   [ 0x1234 ]</pre> |

We’ve also taught `yaml2obj` to infer the compilation unit’s length for us. Now, we’re able to handcraft the `.debug_info` section without caring about the length field.

| Section | Syntax |
|:--------|:-------|
| debug_info | <pre>debug_info:<br>  - Format:     DWARF32 ## Optional<br>    Length:     0x1234  ## Optional<br>    Version:    4<br>    AbbrOffset: 0x00<br>    AddrSize:   0x08    ## Optional<br>    Entries:<br>      - AbbrCode: 1<br>        Values:<br>          - Value: 0x1234<br>          - Value: 0x4321</pre> |

You’ve probably noticed that we still have to calculate the `AbbrOffset` field manually and it makes handcrafting the `.debug_info` section a nightmare. In the next coding period, we’re going to address this issue and make `yaml2obj` able to interlink some DWARF sections. If time permits, we’d also like to add DWARF support to `obj2yaml`.

### Areas in Need of Improvements

In the second coding period, I’m not good at splitting a huge change into several pieces of small patches which brings inconvenience to reviewers. I will try to avoid it in the future. Just as what James has pointed out, I should communicate more with others. When I was implementing these DWARF sections, I should learn about people’s requirements and ask others opinions rather than do it myself and implement what I have in my own mind. I haven’t realized it until I work on the `.debug_loclists` section. Pavel Labath gives me some good advice and comments that I haven’t thought of before!

### Accepted Patches

D84496 [[DWARFYAML] Replace 'Format', 'Version', etc with 'FormParams'. NFC.](https://reviews.llvm.org/D84496)              <br>
D84383 [[DWARFYAML] Pull out common helper functions for rnglist and loclist tables. NFC.](https://reviews.llvm.org/D84383) <br>
D84008 [[DWARFYAML] Refactor emitDebugInfo() to make the length be inferred.](https://reviews.llvm.org/D84008)              <br>
D84239 [[DWARFYAML] Refactor range list table to hold more data structure.](https://reviews.llvm.org/D84239)                <br>
D83624 [[DWARFYAML] Implement the .debug_rnglists section.](https://reviews.llvm.org/D83624)                                <br>
D83853 [[DWARFYAML] Implement the .debug_str_offsets section.](https://reviews.llvm.org/D83853)                             <br>
D83749 [[DWARFYAML] Add support for emitting value forms of strx, addrx, etc.](https://reviews.llvm.org/D83749)             <br>
D83452 [[DWARFYAML] Use override instead of virtual for better safety.](https://reviews.llvm.org/D83452)                    <br>
D83220 [[DWARFYAML][unittest] Refactor parseDWARFYAML().](https://reviews.llvm.org/D83220)

### Ongoing Patches

D84386 [[DWARFYAML] Add support for emitting custom operands for range list entry.](https://reviews.llvm.org/D84386) <br>
D84234 [[DWARFYAML] Implement the .debug_loclists section.](https://reviews.llvm.org/D84234)
