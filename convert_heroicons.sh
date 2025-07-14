#!/bin/bash

# Script to convert all @heroicons/react imports to lucide-react
# This will process all TypeScript and TSX files in the src directory

echo "Starting Heroicons to Lucide React conversion..."

# Find all TypeScript/TSX files that contain @heroicons/react imports
files=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@heroicons/react" 2>/dev/null)

if [ -z "$files" ]; then
    echo "No files with @heroicons/react imports found."
    exit 0
fi

echo "Found $(echo "$files" | wc -l) files to convert:"
echo "$files"

# Create mappings for common icons
declare -A icon_mappings=(
    ["ChartBarIcon"]="BarChart3"
    ["BanknotesIcon"]="Banknote"
    ["CalendarIcon"]="Calendar"
    ["ChevronLeftIcon"]="ChevronLeft"
    ["ChevronRightIcon"]="ChevronRight"
    ["ChevronDownIcon"]="ChevronDown"
    ["ChevronUpIcon"]="ChevronUp"
    ["CreditCardIcon"]="CreditCard"
    ["ViewColumnsIcon"]="Columns3"
    ["TableCellsIcon"]="Table"
    ["SparklesIcon"]="Sparkles"
    ["ClockIcon"]="Clock"
    ["SunIcon"]="Sun"
    ["MoonIcon"]="Moon"
    ["AcademicCapIcon"]="GraduationCap"
    ["LightBulbIcon"]="Lightbulb"
    ["Squares2X2Icon"]="Grid2X2"
    ["ArrowLeftIcon"]="ArrowLeft"
    ["ArrowRightIcon"]="ArrowRight"
    ["BellAlertIcon"]="BellRing"
    ["BellIcon"]="Bell"
    ["PlusIcon"]="Plus"
    ["PlusCircleIcon"]="PlusCircle"
    ["TagIcon"]="Tag"
    ["FolderIcon"]="Folder"
    ["ExclamationTriangleIcon"]="AlertTriangle"
    ["QuestionMarkCircleIcon"]="HelpCircle"
    ["ChatBubbleLeftIcon"]="MessageCircle"
    ["EnvelopeIcon"]="Mail"
    ["BugAntIcon"]="Bug"
    ["ArrowTopRightOnSquareIcon"]="ExternalLink"
    ["XMarkIcon"]="X"
    ["XCircleIcon"]="XCircle"
    ["CheckCircleIcon"]="CheckCircle"
    ["InformationCircleIcon"]="Info"
    ["UserIcon"]="User"
    ["Cog8ToothIcon"]="Settings"
    ["Cog6ToothIcon"]="Settings"
    ["ArrowRightStartOnRectangleIcon"]="LogOut"
    ["MagnifyingGlassIcon"]="Search"
    ["DocumentTextIcon"]="FileText"
    ["TrashIcon"]="Trash2"
    ["PencilIcon"]="Pencil"
    ["EllipsisHorizontalIcon"]="MoreHorizontal"
    ["EllipsisVerticalIcon"]="MoreVertical"
    ["Bars3Icon"]="Menu"
    ["EyeIcon"]="Eye"
    ["EyeSlashIcon"]="EyeOff"
    ["StarIcon"]="Star"
    ["HeartIcon"]="Heart"
    ["HomeIcon"]="Home"
    ["FunnelIcon"]="Filter"
    ["ArrowPathIcon"]="RotateCcw"
    ["DocumentDuplicateIcon"]="Copy"
    ["AdjustmentsVerticalIcon"]="SlidersVertical"
    ["CubeIcon"]="Box"
    ["LinkIcon"]="Link"
    ["ArrowDownTrayIcon"]="Download"
    ["ClipboardDocumentListIcon"]="ClipboardList"
    ["ShieldCheckIcon"]="ShieldCheck"
    ["ComputerDesktopIcon"]="Monitor"
    ["SwatchIcon"]="Palette"
    ["PhoneIcon"]="Phone"
    ["MapPinIcon"]="MapPin"
    ["FireIcon"]="Flame"
    ["BeakerIcon"]="Flask"
    ["MegaphoneIcon"]="Megaphone"
    ["ForwardIcon"]="FastForward"
    ["FlagIcon"]="Flag"
    ["GlobeAltIcon"]="Globe"
    ["GlobeEuropeAfricaIcon"]="Globe2"
    ["LanguageIcon"]="Languages"
    ["BookOpenIcon"]="BookOpen"
    ["BoltIcon"]="Zap"
    ["PhotoIcon"]="Image"
    ["VideoCameraIcon"]="Video"
    ["MusicalNoteIcon"]="Music"
    ["ShoppingCartIcon"]="ShoppingCart"
    ["GiftIcon"]="Gift"
    ["BriefcaseIcon"]="Briefcase"
    ["BuildingOfficeIcon"]="Building2"
    ["PresentationChartLineIcon"]="TrendingUp"
    ["CodeBracketIcon"]="Code"
    ["CommandLineIcon"]="Terminal"
    ["CpuChipIcon"]="Cpu"
    ["ServerIcon"]="Server"
    ["CircleStackIcon"]="Database"
    ["RocketLaunchIcon"]="Rocket"
    ["PaintBrushIcon"]="Paintbrush"
)

# Process each file
for file in $files; do
    echo "Processing $file..."
    
    # First, convert the import statements
    if grep -q "from '@heroicons/react" "$file"; then
        # Create a temporary file for the new imports
        temp_file=$(mktemp)
        
        # Process the file line by line
        while IFS= read -r line; do
            if [[ $line == *"from '@heroicons/react"* ]]; then
                # This is an import line, convert it
                echo "// Converting import: $line" >> "$temp_file"
                
                # Extract the imported icons
                import_part=$(echo "$line" | sed -n 's/.*{\(.*\)}.*/\1/p')
                
                # Convert each icon in the import
                converted_imports=""
                IFS=',' read -ra ICONS <<< "$import_part"
                for icon in "${ICONS[@]}"; do
                    # Trim whitespace
                    icon=$(echo "$icon" | xargs)
                    
                    # Check if this icon has a mapping
                    if [[ -n "${icon_mappings[$icon]}" ]]; then
                        if [[ -n "$converted_imports" ]]; then
                            converted_imports="$converted_imports, "
                        fi
                        converted_imports="$converted_imports${icon_mappings[$icon]} as $icon"
                    else
                        # Keep the original icon name, but flag it
                        echo "// WARNING: No mapping found for $icon" >> "$temp_file"
                        if [[ -n "$converted_imports" ]]; then
                            converted_imports="$converted_imports, "
                        fi
                        converted_imports="$converted_imports$icon"
                    fi
                done
                
                # Write the new import line
                echo "import { $converted_imports } from 'lucide-react'" >> "$temp_file"
            else
                # Regular line, copy as-is
                echo "$line" >> "$temp_file"
            fi
        done < "$file"
        
        # Replace the original file with the converted one
        mv "$temp_file" "$file"
        echo "Converted imports in $file"
    fi
done

echo "Conversion complete!"
echo "Please review the converted files and check for any warnings about unmapped icons."
echo "You may need to manually adjust some icon names that don't have direct equivalents."