<?php
/**
 * Plugin Name: X-SME Booking Widget
 * Plugin URI: https://x-sme.ir
 * Description: ویجت رزرو آسان برای کسب‌وکارهای ایرانی - بدون نیاز به دانش فنی!
 * Version: 1.2.0
 * Author: X-SME Team
 * License: GPL v2 or later
 * Text Domain: xsme-widget
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class XSMEBookingWidget {
    
    private $options;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        
        // Shortcode support
        add_shortcode('xsme_booking', array($this, 'widget_shortcode'));
        
        // Gutenberg block
        add_action('init', array($this, 'register_gutenberg_block'));
        
        // Classic editor button
        add_action('media_buttons', array($this, 'add_media_button'));
        add_action('wp_footer', array($this, 'add_widget_popup'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        
        // AJAX handlers
        add_action('wp_ajax_xsme_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_xsme_test_connection', array($this, 'test_connection'));
        add_action('wp_ajax_xsme_generate_shortcode', array($this, 'generate_shortcode'));
        
        // Widget for sidebars
        add_action('widgets_init', array($this, 'register_widget'));
        
        // Activation hook
        register_activation_hook(__FILE__, array($this, 'activate'));
    }
    
    public function init() {
        $this->options = get_option('xsme_widget_options', array());
        load_plugin_textdomain('xsme-widget', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        // Only enqueue if widget is used on the page
        if ($this->is_widget_used()) {
            wp_enqueue_script(
                'xsme-widget', 
                'https://widget.x-sme.ir/widget.js', 
                array(), 
                '1.2.0', 
                true
            );
            
            // Add custom CSS for WordPress themes
            wp_add_inline_style('wp-block-library', '
                .xsme-widget-container {
                    margin: 20px 0;
                    clear: both;
                }
                .xsme-widget-container iframe {
                    max-width: 100%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-radius: 12px;
                }
            ');
        }
    }
    
    public function admin_enqueue_scripts($hook) {
        if ('toplevel_page_xsme-widget' !== $hook) return;
        
        wp_enqueue_style('xsme-admin-style', plugin_dir_url(__FILE__) . 'admin/style.css');
        wp_enqueue_script('xsme-admin-script', plugin_dir_url(__FILE__) . 'admin/script.js', array('jquery'), '1.2.0', true);
        
        wp_localize_script('xsme-admin-script', 'xsme_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('xsme_nonce')
        ));
    }
    
    /**
     * Simple shortcode for non-technical users
     * Usage: [xsme_booking] or [xsme_booking business_id="123" theme="dark"]
     */
    public function widget_shortcode($atts) {
        $atts = shortcode_atts(array(
            'business_id' => $this->get_option('business_id'),
            'theme' => $this->get_option('theme', 'light'),
            'language' => $this->get_option('language', 'fa'),
            'primary_color' => $this->get_option('primary_color', '#3b82f6'),
            'border_radius' => $this->get_option('border_radius', '8'),
            'show_logo' => $this->get_option('show_logo', 'true'),
            'show_business_info' => $this->get_option('show_business_info', 'true'),
            'allow_notes' => $this->get_option('allow_notes', 'true'),
            'require_email' => $this->get_option('require_email', 'false'),
            'max_advance_booking' => $this->get_option('max_advance_booking', '30'),
            'min_advance_booking' => $this->get_option('min_advance_booking', '2'),
            'width' => $this->get_option('width', '100%'),
            'height' => $this->get_option('height', '400px'),
        ), $atts);
        
        if (empty($atts['business_id'])) {
            return '<div class="xsme-error">❌ لطفاً ابتدا شناسه کسب‌وکار را در تنظیمات پلاگین وارد کنید.</div>';
        }
        
        $widget_id = 'xsme-widget-' . uniqid();
        
        $output = '<div class="xsme-widget-container" style="text-align: center;">';
        $output .= '<div id="' . $widget_id . '" ';
        $output .= 'data-business-id="' . esc_attr($atts['business_id']) . '" ';
        $output .= 'data-theme="' . esc_attr($atts['theme']) . '" ';
        $output .= 'data-language="' . esc_attr($atts['language']) . '" ';
        $output .= 'data-primary-color="' . esc_attr($atts['primary_color']) . '" ';
        $output .= 'data-border-radius="' . esc_attr($atts['border_radius']) . '" ';
        $output .= 'data-show-logo="' . esc_attr($atts['show_logo']) . '" ';
        $output .= 'data-show-business-info="' . esc_attr($atts['show_business_info']) . '" ';
        $output .= 'data-allow-notes="' . esc_attr($atts['allow_notes']) . '" ';
        $output .= 'data-require-email="' . esc_attr($atts['require_email']) . '" ';
        $output .= 'data-max-advance-booking="' . esc_attr($atts['max_advance_booking']) . '" ';
        $output .= 'data-min-advance-booking="' . esc_attr($atts['min_advance_booking']) . '" ';
        $output .= 'style="width: ' . esc_attr($atts['width']) . '; min-height: ' . esc_attr($atts['height']) . ';">';
        
        // Loading placeholder
        $output .= '<div style="padding: 40px; text-align: center; background: #f8f9fa; border-radius: 12px; border: 2px dashed #ddd;">';
        $output .= '<div style="font-size: 24px; margin-bottom: 10px;">⏳</div>';
        $output .= '<p style="margin: 0; color: #666;">در حال بارگذاری ویجت رزرو...</p>';
        $output .= '</div>';
        
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Register Gutenberg block for visual editor
     */
    public function register_gutenberg_block() {
        if (!function_exists('register_block_type')) return;
        
        wp_register_script(
            'xsme-gutenberg-block',
            plugin_dir_url(__FILE__) . 'blocks/xsme-block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            '1.2.0'
        );
        
        register_block_type('xsme/booking-widget', array(
            'editor_script' => 'xsme-gutenberg-block',
            'render_callback' => array($this, 'render_gutenberg_block'),
        ));
    }
    
    public function render_gutenberg_block($attributes) {
        return $this->widget_shortcode($attributes);
    }
    
    /**
     * Add button to classic editor
     */
    public function add_media_button() {
        echo '<button type="button" class="button" id="xsme-add-widget-btn">';
        echo '<span class="dashicons dashicons-calendar-alt" style="vertical-align: middle;"></span> ';
        echo 'افزودن ویجت رزرو';
        echo '</button>';
    }
    
    /**
     * Widget popup for easy insertion
     */
    public function add_widget_popup() {
        $screen = get_current_screen();
        if (!$screen || ($screen->base !== 'post' && $screen->base !== 'page')) return;
        ?>
        <div id="xsme-widget-popup" style="display: none;">
            <div class="xsme-popup-content">
                <h3>افزودن ویجت رزرو X-SME</h3>
                <div class="xsme-form-group">
                    <label>شناسه کسب‌وکار:</label>
                    <input type="text" id="xsme-popup-business-id" value="<?php echo esc_attr($this->get_option('business_id')); ?>" />
                    <small>اگر خالی باشد، از تنظیمات پلاگین استفاده می‌شود</small>
                </div>
                <div class="xsme-form-group">
                    <label>تم:</label>
                    <select id="xsme-popup-theme">
                        <option value="light">روشن</option>
                        <option value="dark">تیره</option>
                    </select>
                </div>
                <div class="xsme-form-group">
                    <label>رنگ اصلی:</label>
                    <input type="color" id="xsme-popup-color" value="#3b82f6" />
                </div>
                <div class="xsme-popup-buttons">
                    <button type="button" class="button-primary" id="xsme-insert-widget">افزودن ویجت</button>
                    <button type="button" class="button" id="xsme-cancel-popup">انصراف</button>
                </div>
            </div>
        </div>
        
        <style>
        #xsme-widget-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999999;
        }
        .xsme-popup-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 12px;
            min-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .xsme-form-group {
            margin-bottom: 15px;
        }
        .xsme-form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .xsme-form-group input,
        .xsme-form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .xsme-popup-buttons {
            text-align: center;
            margin-top: 20px;
        }
        .xsme-popup-buttons button {
            margin: 0 10px;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            $('#xsme-add-widget-btn').click(function() {
                $('#xsme-widget-popup').show();
            });
            
            $('#xsme-cancel-popup').click(function() {
                $('#xsme-widget-popup').hide();
            });
            
            $('#xsme-insert-widget').click(function() {
                var businessId = $('#xsme-popup-business-id').val();
                var theme = $('#xsme-popup-theme').val();
                var color = $('#xsme-popup-color').val();
                
                var shortcode = '[xsme_booking';
                if (businessId) shortcode += ' business_id="' + businessId + '"';
                if (theme !== 'light') shortcode += ' theme="' + theme + '"';
                if (color !== '#3b82f6') shortcode += ' primary_color="' + color + '"';
                shortcode += ']';
                
                // Insert into editor
                if (typeof tinymce !== 'undefined' && tinymce.activeEditor) {
                    tinymce.activeEditor.insertContent(shortcode);
                } else {
                    // Fallback for text mode
                    var editor = $('#content');
                    if (editor.length) {
                        var cursorPos = editor.prop('selectionStart');
                        var textBefore = editor.val().substring(0, cursorPos);
                        var textAfter = editor.val().substring(cursorPos);
                        editor.val(textBefore + shortcode + textAfter);
                    }
                }
                
                $('#xsme-widget-popup').hide();
            });
        });
        </script>
        <?php
    }
    
    /**
     * Admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'X-SME Widget',
            'ویجت رزرو',
            'manage_options',
            'xsme-widget',
            array($this, 'admin_page'),
            'dashicons-calendar-alt',
            30
        );
        
        add_submenu_page(
            'xsme-widget',
            'راهنما',
            'راهنما',
            'manage_options',
            'xsme-widget-help',
            array($this, 'help_page')
        );
    }
    
    public function admin_init() {
        register_setting('xsme_widget_options', 'xsme_widget_options');
    }
    
    /**
     * Admin page with simple interface
     */
    public function admin_page() {
        if (isset($_POST['submit'])) {
            $options = array(
                'business_id' => sanitize_text_field($_POST['business_id']),
                'theme' => sanitize_text_field($_POST['theme']),
                'language' => sanitize_text_field($_POST['language']),
                'primary_color' => sanitize_hex_color($_POST['primary_color']),
                'border_radius' => intval($_POST['border_radius']),
                'show_logo' => isset($_POST['show_logo']) ? 'true' : 'false',
                'show_business_info' => isset($_POST['show_business_info']) ? 'true' : 'false',
                'allow_notes' => isset($_POST['allow_notes']) ? 'true' : 'false',
                'require_email' => isset($_POST['require_email']) ? 'true' : 'false',
                'max_advance_booking' => intval($_POST['max_advance_booking']),
                'min_advance_booking' => intval($_POST['min_advance_booking']),
            );
            
            update_option('xsme_widget_options', $options);
            echo '<div class="notice notice-success"><p>✅ تنظیمات با موفقیت ذخیره شد!</p></div>';
        }
        
        $options = get_option('xsme_widget_options', array());
        ?>
        
        <div class="wrap">
            <h1>🚀 تنظیمات ویجت رزرو X-SME</h1>
            <p>ویجت رزرو را بدون نیاز به دانش فنی در وب‌سایت خود قرار دهید!</p>
            
            <div class="xsme-admin-container">
                <div class="xsme-admin-main">
                    <form method="post" action="">
                        <table class="form-table">
                            <tr>
                                <th scope="row">شناسه کسب‌وکار *</th>
                                <td>
                                    <input type="text" name="business_id" value="<?php echo esc_attr($this->get_option('business_id')); ?>" class="regular-text" required />
                                    <p class="description">شناسه کسب‌وکار خود را از پنل X-SME دریافت کنید</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">تم ظاهری</th>
                                <td>
                                    <select name="theme">
                                        <option value="light" <?php selected($this->get_option('theme'), 'light'); ?>>روشن</option>
                                        <option value="dark" <?php selected($this->get_option('theme'), 'dark'); ?>>تیره</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">زبان</th>
                                <td>
                                    <select name="language">
                                        <option value="fa" <?php selected($this->get_option('language'), 'fa'); ?>>فارسی</option>
                                        <option value="en" <?php selected($this->get_option('language'), 'en'); ?>>انگلیسی</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">رنگ اصلی</th>
                                <td>
                                    <input type="color" name="primary_color" value="<?php echo esc_attr($this->get_option('primary_color', '#3b82f6')); ?>" />
                                    <p class="description">رنگ اصلی ویجت را انتخاب کنید</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">گردی گوشه‌ها</th>
                                <td>
                                    <input type="range" name="border_radius" min="0" max="20" value="<?php echo esc_attr($this->get_option('border_radius', '8')); ?>" />
                                    <span id="border-radius-value"><?php echo esc_attr($this->get_option('border_radius', '8')); ?>px</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">گزینه‌های نمایش</th>
                                <td>
                                    <fieldset>
                                        <label><input type="checkbox" name="show_logo" <?php checked($this->get_option('show_logo'), 'true'); ?> /> نمایش لوگو</label><br>
                                        <label><input type="checkbox" name="show_business_info" <?php checked($this->get_option('show_business_info'), 'true'); ?> /> نمایش اطلاعات کسب‌وکار</label><br>
                                        <label><input type="checkbox" name="allow_notes" <?php checked($this->get_option('allow_notes'), 'true'); ?> /> امکان یادداشت</label><br>
                                        <label><input type="checkbox" name="require_email" <?php checked($this->get_option('require_email'), 'true'); ?> /> ایمیل الزامی</label>
                                    </fieldset>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">تنظیمات رزرو</th>
                                <td>
                                    <p>حداکثر روزهای رزرو از قبل: <input type="number" name="max_advance_booking" value="<?php echo esc_attr($this->get_option('max_advance_booking', '30')); ?>" min="1" max="365" style="width: 80px;" /> روز</p>
                                    <p>حداقل ساعات رزرو از قبل: <input type="number" name="min_advance_booking" value="<?php echo esc_attr($this->get_option('min_advance_booking', '2')); ?>" min="1" max="48" style="width: 80px;" /> ساعت</p>
                                </td>
                            </tr>
                        </table>
                        
                        <p class="submit">
                            <input type="submit" name="submit" class="button-primary" value="ذخیره تنظیمات" />
                            <button type="button" class="button" id="test-widget">تست ویجت</button>
                            <button type="button" class="button" id="generate-shortcode">ایجاد شورت‌کد</button>
                        </p>
                    </form>
                </div>
                
                <div class="xsme-admin-sidebar">
                    <div class="xsme-widget-card">
                        <h3>🎯 نحوه استفاده</h3>
                        <ol>
                            <li>شناسه کسب‌وکار خود را وارد کنید</li>
                            <li>تنظیمات دلخواه را انتخاب کنید</li>
                            <li>روی "ذخیره تنظیمات" کلیک کنید</li>
                            <li>در هر صفحه/پست: <code>[xsme_booking]</code></li>
                        </ol>
                    </div>
                    
                    <div class="xsme-widget-card">
                        <h3>⚡ درج سریع</h3>
                        <p>در ویرایشگر متن، روی دکمه "افزودن ویجت رزرو" کلیک کنید</p>
                        <p>یا از شورت‌کد استفاده کنید:</p>
                        <code>[xsme_booking]</code>
                    </div>
                    
                    <div class="xsme-widget-card">
                        <h3>🛠️ سفارشی‌سازی</h3>
                        <p>برای تنظیمات مخصوص هر صفحه:</p>
                        <code>[xsme_booking theme="dark" primary_color="#ff6b6b"]</code>
                    </div>
                    
                    <div class="xsme-widget-card">
                        <h3>📞 پشتیبانی</h3>
                        <p>نیاز به کمک دارید؟</p>
                        <p>📧 support@x-sme.ir</p>
                        <p>📱 ۰۹۱۲-۳۴۵-۶۷۸۹</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .xsme-admin-container {
            display: flex;
            gap: 30px;
            margin-top: 20px;
        }
        .xsme-admin-main {
            flex: 2;
        }
        .xsme-admin-sidebar {
            flex: 1;
        }
        .xsme-widget-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .xsme-widget-card h3 {
            margin-top: 0;
            color: #3b82f6;
        }
        .xsme-widget-card code {
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            // Update border radius value
            $('input[name="border_radius"]').on('input', function() {
                $('#border-radius-value').text($(this).val() + 'px');
            });
            
            // Test widget
            $('#test-widget').click(function() {
                var businessId = $('input[name="business_id"]').val();
                if (!businessId) {
                    alert('لطفاً ابتدا شناسه کسب‌وکار را وارد کنید');
                    return;
                }
                
                window.open('https://widget.x-sme.ir/widget?businessId=' + businessId, '_blank');
            });
            
            // Generate shortcode
            $('#generate-shortcode').click(function() {
                var shortcode = '[xsme_booking]';
                prompt('شورت‌کد شما (کپی کنید):', shortcode);
            });
        });
        </script>
        <?php
    }
    
    public function help_page() {
        ?>
        <div class="wrap">
            <h1>📖 راهنمای استفاده از ویجت رزرو</h1>
            
            <div class="xsme-help-content">
                <h2>🚀 نصب و راه‌اندازی</h2>
                <div class="xsme-help-step">
                    <h3>گام ۱: دریافت شناسه کسب‌وکار</h3>
                    <p>از پنل مدیریت X-SME، شناسه کسب‌وکار خود را کپی کنید</p>
                </div>
                
                <div class="xsme-help-step">
                    <h3>گام ۲: تنظیم پلاگین</h3>
                    <p>به منوی "ویجت رزرو" بروید و شناسه را وارد کنید</p>
                </div>
                
                <div class="xsme-help-step">
                    <h3>گام ۳: افزودن به صفحه</h3>
                    <p>در ویرایشگر، شورت‌کد <code>[xsme_booking]</code> را اضافه کنید</p>
                </div>
                
                <h2>🎨 تنظیمات پیشرفته</h2>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>پارامتر</th>
                            <th>نمونه</th>
                            <th>توضیحات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>business_id</td>
                            <td>"abc123"</td>
                            <td>شناسه کسب‌وکار</td>
                        </tr>
                        <tr>
                            <td>theme</td>
                            <td>"dark"</td>
                            <td>تم ظاهری (light/dark)</td>
                        </tr>
                        <tr>
                            <td>primary_color</td>
                            <td>"#ff6b6b"</td>
                            <td>رنگ اصلی</td>
                        </tr>
                        <tr>
                            <td>border_radius</td>
                            <td>"16"</td>
                            <td>گردی گوشه‌ها</td>
                        </tr>
                    </tbody>
                </table>
                
                <h2>🔧 نمونه‌های کاربردی</h2>
                <div class="xsme-examples">
                    <h4>ویجت ساده:</h4>
                    <code>[xsme_booking]</code>
                    
                    <h4>ویجت تیره:</h4>
                    <code>[xsme_booking theme="dark"]</code>
                    
                    <h4>ویجت سفارشی:</h4>
                    <code>[xsme_booking theme="light" primary_color="#e91e63" border_radius="12"]</code>
                </div>
            </div>
        </div>
        
        <style>
        .xsme-help-content {
            max-width: 800px;
        }
        .xsme-help-step {
            background: #f9f9f9;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
        }
        .xsme-examples {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .xsme-examples h4 {
            margin: 15px 0 5px 0;
            color: #374151;
        }
        .xsme-examples code {
            display: block;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 1px solid #d1d5db;
        }
        </style>
        <?php
    }
    
    // Helper methods
    private function get_option($key, $default = '') {
        return isset($this->options[$key]) ? $this->options[$key] : $default;
    }
    
    private function is_widget_used() {
        global $post;
        if (!$post) return false;
        
        // Check for shortcode in content
        if (has_shortcode($post->post_content, 'xsme_booking')) {
            return true;
        }
        
        // Check for Gutenberg block
        if (has_block('xsme/booking-widget', $post)) {
            return true;
        }
        
        return false;
    }
    
    public function activate() {
        // Set default options
        $default_options = array(
            'theme' => 'light',
            'language' => 'fa',
            'primary_color' => '#3b82f6',
            'border_radius' => '8',
            'show_logo' => 'true',
            'show_business_info' => 'true',
            'allow_notes' => 'true',
            'require_email' => 'false',
            'max_advance_booking' => '30',
            'min_advance_booking' => '2',
        );
        
        add_option('xsme_widget_options', $default_options);
    }
}

// Initialize the plugin
new XSMEBookingWidget();

// Sidebar widget class
class XSME_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'xsme_booking_widget',
            'ویجت رزرو X-SME',
            array('description' => 'ویجت رزرو آنلاین برای sidebar')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $shortcode_atts = array();
        if (!empty($instance['business_id'])) {
            $shortcode_atts['business_id'] = $instance['business_id'];
        }
        if (!empty($instance['theme'])) {
            $shortcode_atts['theme'] = $instance['theme'];
        }
        
        $shortcode = '[xsme_booking';
        foreach ($shortcode_atts as $key => $value) {
            $shortcode .= ' ' . $key . '="' . esc_attr($value) . '"';
        }
        $shortcode .= ']';
        
        echo do_shortcode($shortcode);
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'رزرو آنلاین';
        $business_id = !empty($instance['business_id']) ? $instance['business_id'] : '';
        $theme = !empty($instance['theme']) ? $instance['theme'] : 'light';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">عنوان:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('business_id'); ?>">شناسه کسب‌وکار:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('business_id'); ?>" name="<?php echo $this->get_field_name('business_id'); ?>" type="text" value="<?php echo esc_attr($business_id); ?>">
            <small>اگر خالی باشد، از تنظیمات پلاگین استفاده می‌شود</small>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('theme'); ?>">تم:</label>
            <select class="widefat" id="<?php echo $this->get_field_id('theme'); ?>" name="<?php echo $this->get_field_name('theme'); ?>">
                <option value="light" <?php selected($theme, 'light'); ?>>روشن</option>
                <option value="dark" <?php selected($theme, 'dark'); ?>>تیره</option>
            </select>
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['business_id'] = (!empty($new_instance['business_id'])) ? strip_tags($new_instance['business_id']) : '';
        $instance['theme'] = (!empty($new_instance['theme'])) ? strip_tags($new_instance['theme']) : 'light';
        
        return $instance;
    }
}

// Register widget
function register_xsme_widget() {
    register_widget('XSME_Widget');
}
add_action('widgets_init', 'register_xsme_widget'); 