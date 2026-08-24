/* Browser port of the DataFlex Pygments lexer maintained by Data Access Worldwide:
   https://gitlab.com/data-access-worldwide/projects/data-access-rnd-side-projects/df-docs/-/tree/develop/dataflex-lexer-pkg */
(function (global) {
    "use strict";

    const aliases = new Set(["dataflex", "df", "flex"]);

    const dataFlexKeywords = makeWordSet(`
        a Abort Abort_Transaction Activate_View Add Address All AmbiguousFunctions an Append
        Append_Output as Attach Between BigInt Boolean Break Broadcast Broadcast_Focus by ByRef
        Call_Driver CallStackDump Case Case_Begin Case_End Cd_End_Object channel Char Clear Close
        Close_Input Close_Output CompilerWarnings CompilerLevelWarning Constrain Constrained_Clear
        Constrained_Find Constraint_Set Constraint_Validate Copy_db Copy_Records CopyFile
        Create_Field Create_Index Currency Date DateTime Decimal Declare_Datafile Decrement Define
        Delegate Delete Delete_db Delete_Field Delete_Index Do DFCreate_Menu DFFont DFFontSize
        DFHeaderFrame DFHeaderLineCheck DFHeaderMargin DFHeaderPos DFHeaderWrap DFLineCheck
        DFTopMargin DFBottomMargin DFLeftMargin DFRightMargin DFWrite DFWriteBMP DFWriteEllip
        DFWriteLine DFWriteLn DFWriteLnPos DFWritePos DFWriteRect DFWriteXYLine Direct_Input
        Direct_Output DWord Diskfree Else Entry_Item EraseFile Error External_Function False Field
        Field_Map File_Exist File_Field Fill_Field Find Float Flush_Output for Forward Found from
        Function_Return General Get Get_Argument_Size Get_Attribute Get_Channel_Position
        Get_Channel_Size Get_Current_Directory Get_Current_Input_Channel Get_Current_Output_Channel
        Get_Current_User_Count Get_Date_Attribute Get_Directory Get_Environment Get_FieldNumber
        Get_Field_Value Get_FileNumber Get_File_Mod_Time Get_File_Path Get_Icon_Count
        Get_Licensed_Max_Users Get_StrictEval Get_Transaction_Retry Get_Windows_Directory GetDskInfo
        Global Global_Variable Goto Handle If IfExp IfLine Import_Class_Protocol Include_Resource
        Include_Text Increment Index Integer is Item Load_Def Load_Driver Lock Login Logout Longptr
        ULongptr Make_Directory Make_File Make_Temp_File Move NewRecord Nothing Number of On_Item
        On_Key Open Output Output_Aux_File Output_Wrap Overloaded Playwave Pointer Print Print_Wrap
        Procedure_Return Property Read Read_Block Read_Hex Readln Real Recursive Register_Function
        Register_Object Register_Procedure Registration Relate Remove_Directory RenameFile
        Report_Breaks Reread Returns RowID Runprogram Save SaveRecord Self Send SeqEof SeqEol Set
        Set_Argument_Size Set_Attribute Set_Channel_Position Set_Date_Attribute Set_Directory
        Set_Field_Value Set_File_Mod_Time Set_Relate Set_StrictEval Set_Transaction_Retry Short Show
        Showln Sleep Sort Start_UI String Structure_Abort Structure_Copy Structure_End
        Structure_Start Subtract Sysdate Time TimeSpan to True UBigInt UChar UInteger Unicode
        Unload_Driver Unlock Use Include UShort Variant Valid_Drive Vconstrain Version_Information
        Vfind Wait WebGet WebPublishFunction WebPublishProcedure WebSet WebSetResponsive
        WebRegisterPath Write Write_Hex Writeln WString ZeroFile ZeroString Embed_ActiveX_Resource
        Begin Begin_Row Begin_Transaction Cd_Popup_Object Class Deferred_View DFBeginHeader
        Enum_List Enumeration_List For_All Function Object Composite Procedure Procedure_Section
        Repeat Struct While End Loop Until End_Row End_Transaction End_Class End_Enum_List
        End_Enumeration_List End_For_All End_Function End_Object End_Composite End_Procedure
        End_Pull_Down End_Struct DFEndHeader End_Menu
        #Replace #CHKSUB #IF #IFSUB #IFDEF #IFNDEF #ELSE #ENDIF #Warning #Include #COMMAND
        #ENDCOMMAND #HEADER #ENDHEADER
    `);

    const wordOperators = makeWordSet("max min contains matches not and or iand ior");

    const metadataTags = makeWordSet(`
        Category ClassLibrary ClassType CLSID ColumnBased ComponentType CompositeClass DataAware
        DataBindable DDClass DDOHost Description DesignerClass DesignerJSClass DesignTime EnumList
        FoldedProperty HelpTopic IgnoreError InitialValue ItemParameter MethodType NoDoc Obsolete
        OverrideProperty OverrideProcedure OverrideProcedureSet OverrideFunction PropertyType
        Published Visibility WebProperty Name Navigable NavigableRequiredParent
    `);

    const sqlKeywords = makeWordSet(`
        ABSOLUTE ACTION ADA ADD ALL ALLOCATE ALTER AND ANY ARE AS ASC ASSERTION AT AUTHORIZATION AVG
        BEGIN BETWEEN BIT BIT_LENGTH BOTH CASCADE CASCADED CASE CAST CATALOG CHAR CHAR_LENGTH
        CHARACTER CHARACTER_LENGTH CHECK CLOSE COALESCE COBOL COLLATE COLLATION COLUMN COMMIT
        COMMITTED CONNECT CONNECTION CONSTRAINT CONSTRAINTS CONTINUE CONVERT CORRESPONDING COUNT
        CREATE CROSS CURRENT CURRENT_DATE CURRENT_TIME CURRENT_USER CURSOR DATA DATE DAY DEALLOCATE DEC
        DECIMAL DECLARE DEFAULT DEFERRABLE DEFERRED DELETE DESC DESCRIBE DESCRIPTOR DIAGNOSTICS
        DISCONNECT DISTINCT DOMAIN DOUBLE DROP ELSE END ESCAPE EXCEPT EXCEPTION EXEC EXECUTE EXISTS
        EXTERNAL EXTRACT FALSE FETCH FIRST FLOAT FOR FOREIGN FORTRAN FOUND FROM FULL GET GLOBAL GO GOTO
        GRANT GROUP HAVING HOUR IDENTITY IMMEDIATE IN INDICATOR INITIALLY INNER INPUT INSENSITIVE
        INSERT INT INTEGER INTERSECT INTERVAL INTO IS ISOLATION JOIN KEY LANGUAGE LAST LEADING LEFT
        LENGTH LEVEL LIKE LOCAL LOWER MATCH MAX MIN MINUTE MODULE MONTH MORE MUMPS NAMES NATIONAL
        NATURAL NCHAR NEXT NO NOT NULL NULLABLE NULLIF NUMERIC OF ON ONLY OPEN OPTION OR ORDER OUTER
        OUTPUT OVERLAPS PAD PARTIAL PASCAL PLI POSITION PRECISION PREPARE PRESERVE PRIMARY PRIOR
        PRIVILEGES PROCEDURE PUBLIC read REAL REFERENCES RELATIVE REPEATABLE RESTRICT REVOKE RIGHT
        ROLLBACK ROW ROWS SCALE SCHEMA SCROLL SECOND SECTION SELECT SERIALIZABLE SESSION SESSION_USER
        SET SIZE SMALLINT SOME SPACE SQL SQLCODE SQLERROR SQLSTATE SUBSTRING SUM SYSTEM_USER TABLE
        TEMPORARY THEN TIME TIMESTAMP TIMEZONE_HOUR TIMEZONE_MINUTE TO TRAILING TRANSACTION TRANSLATE
        TRANSLATION TRIM TRUE TYPE UNCOMMITTED UNION UNIQUE UNKNOWN UNNAMED UPDATE UPPER USAGE USER
        USING VALUE VALUES VIEW WHEN WHENEVER WHERE WITH WORK WRITE YEAR ZONE
    `);

    function makeWordSet(value) {
        return new Set(value.trim().toLowerCase().split(/\s+/));
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function token(type, value) {
        return `<span class="df-${type}">${escapeHtml(value)}</span>`;
    }

    function isIdentifierStart(character) {
        return Boolean(character && /[A-Za-z_]/.test(character));
    }

    function isIdentifierPart(character) {
        return Boolean(character && /[A-Za-z0-9_@#$]/.test(character));
    }

    function readIdentifier(source, start, hasDirectivePrefix) {
        let end = start + (hasDirectivePrefix ? 1 : 0);
        while (end < source.length && isIdentifierPart(source[end])) end += 1;
        return end;
    }

    function lineEnd(source, start) {
        const end = source.indexOf("\n", start);
        return end < 0 ? source.length : end;
    }

    function nestedCommentEnd(source, start) {
        let depth = 0;
        let position = start;

        while (position < source.length) {
            if (source.startsWith("/*", position)) {
                depth += 1;
                position += 2;
            } else if (source.startsWith("*/", position)) {
                depth -= 1;
                position += 2;
                if (depth === 0) return position;
            } else {
                position += 1;
            }
        }

        return source.length;
    }

    function quotedEnd(source, contentStart, delimiter) {
        const close = source.indexOf(delimiter, contentStart);
        return close < 0 ? source.length : close + delimiter.length;
    }

    function highlightMetadata(source, start) {
        const output = [token("meta-brace", "{")];
        let position = start + 1;

        while (position < source.length) {
            if (source[position] === "}") {
                output.push(token("meta-brace", "}"));
                return { html: output.join(""), end: position + 1 };
            }

            const whitespace = source.slice(position).match(/^\s+/);
            if (whitespace) {
                output.push(escapeHtml(whitespace[0]));
                position += whitespace[0].length;
                continue;
            }

            if (source.startsWith("+=", position)) {
                output.push(token("meta-assignment", "+="));
                position += 2;
                continue;
            }

            if (source[position] === "=") {
                output.push(token("meta-assignment", "="));
                position += 1;
                continue;
            }

            const value = source.slice(position).match(/^[^=}\s]+/)[0];
            output.push(token(metadataTags.has(value.toLowerCase()) ? "meta-tag" : "meta-value", value));
            position += value.length;
        }

        return { html: output.join(""), end: source.length };
    }

    function highlightSqlString(source, start, opening, delimiter) {
        const output = [token("string", opening)];
        let position = start + opening.length;

        while (position < source.length) {
            if (source.startsWith(delimiter, position)) {
                output.push(token("string", delimiter));
                return { html: output.join(""), end: position + delimiter.length };
            }

            if (source.startsWith("--", position)) {
                const end = lineEnd(source, position);
                output.push(token("comment", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source.startsWith("/*", position)) {
                const end = nestedCommentEnd(source, position);
                output.push(token("comment", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source[position] === "'" && delimiter !== "'") {
                const end = quotedEnd(source, position + 1, "'");
                output.push(token("string", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source[position] === "`") {
                const end = quotedEnd(source, position + 1, "`");
                output.push(token("string", source.slice(position, end)));
                position = end;
                continue;
            }

            const number = source.slice(position).match(/^-?\d+(?:\.\d*)?(?:e-?\d+)?/i);
            if (number) {
                output.push(token("number", number[0]));
                position += number[0].length;
                continue;
            }

            if (isIdentifierStart(source[position])) {
                const end = readIdentifier(source, position, false);
                const word = source.slice(position, end);
                output.push(sqlKeywords.has(word.toLowerCase()) ? token("keyword", word) : token("string", word));
                position = end;
                continue;
            }

            if (/[%&*+\-\/<>=?|#.]/.test(source[position])) {
                output.push(token("operator", source[position]));
                position += 1;
                continue;
            }

            output.push(token("string", source[position]));
            position += 1;
        }

        return { html: output.join(""), end: source.length };
    }

    function highlight(source) {
        source = String(source || "");
        const output = [];
        let position = 0;

        while (position < source.length) {
            if (source.startsWith("//", position)) {
                const end = lineEnd(source, position);
                output.push(token("comment", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source.startsWith("/*", position)) {
                const end = nestedCommentEnd(source, position);
                output.push(token("comment", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source[position] === "{") {
                const result = highlightMetadata(source, position);
                output.push(result.html);
                position = result.end;
                continue;
            }

            const sqlString = [
                ["@SQL\"\"\"", "\"\"\""],
                ["@SQL\"", "\""],
                ["@SQL'", "'"]
            ].find(([opening]) => source.startsWith(opening, position));
            if (sqlString) {
                const result = highlightSqlString(source, position, sqlString[0], sqlString[1]);
                output.push(result.html);
                position = result.end;
                continue;
            }

            const regularString = [
                ["\"\"\"", "\"\"\""],
                ["@\"", "\""],
                ["\"", "\""],
                ["'", "'"]
            ].find(([opening]) => source.startsWith(opening, position));
            if (regularString) {
                const end = quotedEnd(source, position + regularString[0].length, regularString[1]);
                output.push(token("string", source.slice(position, end)));
                position = end;
                continue;
            }

            if (source[position] === "!" && /\w/.test(source[position + 1] || "")) {
                const match = source.slice(position).match(/^!\w+/)[0];
                output.push(token("comment", match));
                position += match.length;
                continue;
            }

            const hasDirectivePrefix = source[position] === "#" && isIdentifierStart(source[position + 1]);
            if (isIdentifierStart(source[position]) || hasDirectivePrefix) {
                const end = readIdentifier(source, position, hasDirectivePrefix);
                const word = source.slice(position, end);
                const normalized = word.toLowerCase();

                if (wordOperators.has(normalized)) {
                    output.push(token("operator", word));
                } else if (dataFlexKeywords.has(normalized)) {
                    output.push(token("keyword", word));
                } else {
                    output.push(escapeHtml(word));
                }

                position = end;
                continue;
            }

            const twoCharacterOperator = source.slice(position, position + 2);
            if (["<>", "<=", ">="].includes(twoCharacterOperator)) {
                output.push(token("operator", twoCharacterOperator));
                position += 2;
                continue;
            }

            if (/[+\-*/^=<>&.]/.test(source[position])) {
                output.push(token("operator", source[position]));
                position += 1;
                continue;
            }

            const number = source.slice(position).match(/^\d+(?:\.\d*)?(?:e-?\d+)?/i);
            if (number) {
                output.push(token("number", number[0]));
                position += number[0].length;
                continue;
            }

            output.push(escapeHtml(source[position]));
            position += 1;
        }

        return output.join("");
    }

    function supports(language) {
        const name = String(language || "").trim().toLowerCase().split(/\s+/, 1)[0];
        return aliases.has(name);
    }

    global.DataFlexHighlighter = Object.freeze({ highlight, supports });
})(window);
