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
        
        // Admin interface
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        
        // Gutenberg block
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        add_action('init', array($this, 'register_block'));
        
        // Classic Editor button
        add_action('media_buttons', array($this, 'add_media_button'));
        add_action('wp_ajax_xsme_widget_popup', array($this, 'widget_popup'));
        
        // Widget support
        add_action('widgets_init', array($this, 'register_widget'));
        
        $this->options = get_option('xsme_options');
    }
    
    public function init() {
        load_plugin_textdomain('xsme-widget', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    /**
     * Enqueue scripts on frontend
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'xsme-widget-script',
            'https://widget.x-sme.ir/widget.js',
            array(),
            '1.2.0',
            true
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function admin_enqueue_scripts($hook) {
        if ('settings_page_xsme-widget' !== $hook) {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_script(
            'xsme-admin',
            plugin_dir_url(__FILE__) . 'admin.js',
            array('jquery', 'wp-color-picker'),
            '1.2.0',
            true
        );
    }
    
    /**
     * Shortcode handler
     */
    public function widget_shortcode($atts) {
        $atts = shortcode_atts(array(
            'business_id' => '',
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
            'height' => 'auto'
        ), $atts, 'xsme_booking');
        
        if (empty($atts['business_id'])) {
            return '<div style="background: #fee; border: 1px solid #fcc; padding: 10px; color: #c00; border-radius: 4px;">خطا: شناسه کسب‌وکار مشخص نشده است</div>';
        }
        
        $container_id = 'xsme-widget-' . uniqid();
        
        $output = '<div id="' . esc_attr($container_id) . '" class="xsme-booking-widget"';
        $output .= ' data-business-id="' . esc_attr($atts['business_id']) . '"';
        $output .= ' data-theme="' . esc_attr($atts['theme']) . '"';
        $output .= ' data-language="' . esc_attr($atts['language']) . '"';
        $output .= ' data-primary-color="' . esc_attr($atts['primary_color']) . '"';
        $output .= ' data-border-radius="' . esc_attr($atts['border_radius']) . '"';
        $output .= ' data-show-logo="' . esc_attr($atts['show_logo']) . '"';
        $output .= ' data-show-business-info="' . esc_attr($atts['show_business_info']) . '"';
        $output .= ' data-allow-notes="' . esc_attr($atts['allow_notes']) . '"';
        $output .= ' data-require-email="' . esc_attr($atts['require_email']) . '"';
        $output .= ' data-max-advance-booking="' . esc_attr($atts['max_advance_booking']) . '"';
        $output .= ' data-min-advance-booking="' . esc_attr($atts['min_advance_booking']) . '"';
        $output .= ' style="min-height: 350px; width: 100%;">';
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'تنظیمات X-SME Widget',
            'X-SME Widget',
            'manage_options',
            'xsme-widget',
            array($this, 'options_page')
        );
    }
    
    /**
     * Admin settings init
     */
    public function admin_init() {
        register_setting('xsme_options', 'xsme_options');
        
        add_settings_section(
            'xsme_main_section',
            'تنظیمات اصلی',
            array($this, 'section_callback'),
            'xsme-widget'
        );
        
        add_settings_field(
            'business_id',
            'شناسه کسب‌وکار پیش‌فرض',
            array($this, 'business_id_callback'),
            'xsme-widget',
            'xsme_main_section'
        );
        
        add_settings_field(
            'theme',
            'تم پیش‌فرض',
            array($this, 'theme_callback'),
            'xsme-widget',
            'xsme_main_section'
        );
        
        add_settings_field(
            'primary_color',
            'رنگ اصلی پیش‌فرض',
            array($this, 'color_callback'),
            'xsme-widget',
            'xsme_main_section'
        );
    }
    
    /**
     * Options page HTML
     */
    public function options_page() {
        ?>
        <div class="wrap">
            <h1>تنظیمات X-SME Booking Widget</h1>
            
            <div style="background: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3>🎯 استفاده آسان:</h3>
                <p><strong>در هر صفحه یا پست:</strong></p>
                <code>[xsme_booking business_id="your-business-id"]</code>
                
                <p style="margin-top: 15px;"><strong>با تنظیمات سفارشی:</strong></p>
                <code>[xsme_booking business_id="your-id" theme="dark" primary_color="#ff6b6b"]</code>
            </div>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('xsme_options');
                do_settings_sections('xsme-widget');
                submit_button('ذخیره تنظیمات');
                ?>
            </form>
            
            <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 5px;">
                <h3>📚 راهنمای کامل</h3>
                <p>برای مشاهده تمام گزینه‌ها و نحوه استفاده:</p>
                <a href="https://x-sme.ir/widget-docs" target="_blank" class="button button-primary">
                    مشاهده مستندات کامل
                </a>
            </div>
        </div>
        <?php
    }
    
    public function section_callback() {
        echo '<p>تنظیمات پیش‌فرض برای تمام ویجت‌ها</p>';
    }
    
    public function business_id_callback() {
        $value = isset($this->options['business_id']) ? $this->options['business_id'] : '';
        echo '<input type="text" name="xsme_options[business_id]" value="' . esc_attr($value) . '" class="regular-text" placeholder="business-123" />';
        echo '<p class="description">شناسه کسب‌وکار پیش‌فرض (از پنل X-SME دریافت کنید)</p>';
    }
    
    public function theme_callback() {
        $value = isset($this->options['theme']) ? $this->options['theme'] : 'light';
        echo '<select name="xsme_options[theme]">';
        echo '<option value="light"' . selected($value, 'light', false) . '>روشن</option>';
        echo '<option value="dark"' . selected($value, 'dark', false) . '>تیره</option>';
        echo '</select>';
    }
    
    public function color_callback() {
        $value = isset($this->options['primary_color']) ? $this->options['primary_color'] : '#3b82f6';
        echo '<input type="text" name="xsme_options[primary_color]" value="' . esc_attr($value) . '" class="color-picker" />';
    }
    
    /**
     * Add media button for classic editor
     */
    public function add_media_button() {
        echo '<a href="#" class="button xsme-media-button" onclick="xsmeOpenPopup()">
                  🎯 افزودن ویجت X-SME
              </a>';
        
        // Add popup HTML
        add_action('admin_footer', array($this, 'media_button_popup'));
    }
    
    /**
     * Media button popup
     */
    public function media_button_popup() {
        ?>
        <div id="xsme-popup" style="display: none;">
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 100000;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; width: 500px; max-width: 90%;">
                    <h3 style="margin-top: 0;">افزودن ویجت X-SME</h3>
                    
                    <table class="form-table">
                        <tr>
                            <th><label for="popup-business-id">شناسه کسب‌وکار *</label></th>
                            <td><input type="text" id="popup-business-id" class="regular-text" placeholder="business-123" /></td>
                        </tr>
                        <tr>
                            <th><label for="popup-theme">تم</label></th>
                            <td>
                                <select id="popup-theme">
                                    <option value="light">روشن</option>
                                    <option value="dark">تیره</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="popup-color">رنگ اصلی</label></th>
                            <td><input type="color" id="popup-color" value="#3b82f6" /></td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; text-align: right;">
                        <button type="button" class="button" onclick="xsmeClosePopup()">انصراف</button>
                        <button type="button" class="button button-primary" onclick="xsmeInsertShortcode()">افزودن به محتوا</button>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            function xsmeOpenPopup() {
                document.getElementById('xsme-popup').style.display = 'block';
            }
            
            function xsmeClosePopup() {
                document.getElementById('xsme-popup').style.display = 'none';
            }
            
            function xsmeInsertShortcode() {
                var businessId = document.getElementById('popup-business-id').value;
                var theme = document.getElementById('popup-theme').value;
                var color = document.getElementById('popup-color').value;
                
                if (!businessId) {
                    alert('لطفاً شناسه کسب‌وکار را وارد کنید');
                    return;
                }
                
                var shortcode = '[xsme_booking business_id="' + businessId + '"';
                if (theme !== 'light') shortcode += ' theme="' + theme + '"';
                if (color !== '#3b82f6') shortcode += ' primary_color="' + color + '"';
                shortcode += ']';
                
                // Insert into editor
                if (typeof tinyMCE !== 'undefined' && tinyMCE.activeEditor) {
                    tinyMCE.activeEditor.insertContent(shortcode);
                } else {
                    // Fallback for text editor
                    var textarea = document.getElementById('content');
                    if (textarea) {
                        textarea.value += shortcode;
                    }
                }
                
                xsmeClosePopup();
            }
        </script>
        <?php
    }
    
    /**
     * Register Gutenberg block
     */
    public function register_block() {
        wp_register_script(
            'xsme-block',
            plugin_dir_url(__FILE__) . 'block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            '1.2.0'
        );
        
        register_block_type('xsme/booking-widget', array(
            'editor_script' => 'xsme-block',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'businessId' => array('type' => 'string', 'default' => ''),
                'theme' => array('type' => 'string', 'default' => 'light'),
                'primaryColor' => array('type' => 'string', 'default' => '#3b82f6'),
                'borderRadius' => array('type' => 'number', 'default' => 8),
            )
        ));
    }
    
    /**
     * Render Gutenberg block
     */
    public function render_block($attributes) {
        if (empty($attributes['businessId'])) {
            return '<div style="background: #fee; border: 1px solid #fcc; padding: 10px; color: #c00;">شناسه کسب‌وکار مشخص نشده</div>';
        }
        
        return $this->widget_shortcode($attributes);
    }
    
    /**
     * Enqueue Gutenberg block assets
     */
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'xsme-block',
            plugin_dir_url(__FILE__) . 'block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
            '1.2.0'
        );
    }
    
    /**
     * Register WordPress widget
     */
    public function register_widget() {
        register_widget('XSME_Widget');
    }
}

/**
 * WordPress Widget Class
 */
class XSME_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'xsme_widget',
            'X-SME Booking Widget',
            array('description' => 'ویجت رزرو آنلاین X-SME')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        if (!empty($instance['business_id'])) {
            $shortcode_atts = array(
                'business_id' => $instance['business_id'],
                'theme' => !empty($instance['theme']) ? $instance['theme'] : 'light',
                'primary_color' => !empty($instance['primary_color']) ? $instance['primary_color'] : '#3b82f6'
            );
            
            $xsme = new XSMEBookingWidget();
            echo $xsme->widget_shortcode($shortcode_atts);
        }
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : '';
        $business_id = !empty($instance['business_id']) ? $instance['business_id'] : '';
        $theme = !empty($instance['theme']) ? $instance['theme'] : 'light';
        $primary_color = !empty($instance['primary_color']) ? $instance['primary_color'] : '#3b82f6';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">عنوان:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('business_id'); ?>">شناسه کسب‌وکار:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('business_id'); ?>" name="<?php echo $this->get_field_name('business_id'); ?>" type="text" value="<?php echo esc_attr($business_id); ?>" placeholder="business-123">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('theme'); ?>">تم:</label>
            <select class="widefat" id="<?php echo $this->get_field_id('theme'); ?>" name="<?php echo $this->get_field_name('theme'); ?>">
                <option value="light" <?php selected($theme, 'light'); ?>>روشن</option>
                <option value="dark" <?php selected($theme, 'dark'); ?>>تیره</option>
            </select>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('primary_color'); ?>">رنگ اصلی:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('primary_color'); ?>" name="<?php echo $this->get_field_name('primary_color'); ?>" type="color" value="<?php echo esc_attr($primary_color); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['business_id'] = (!empty($new_instance['business_id'])) ? strip_tags($new_instance['business_id']) : '';
        $instance['theme'] = (!empty($new_instance['theme'])) ? strip_tags($new_instance['theme']) : 'light';
        $instance['primary_color'] = (!empty($new_instance['primary_color'])) ? strip_tags($new_instance['primary_color']) : '#3b82f6';
        
        return $instance;
    }
}

// Initialize the plugin
new XSMEBookingWidget();

// Activation hook
register_activation_hook(__FILE__, 'xsme_widget_activate');
function xsme_widget_activate() {
    // Set default options
    $default_options = array(
        'business_id' => '',
        'theme' => 'light',
        'primary_color' => '#3b82f6'
    );
    
    add_option('xsme_options', $default_options);
} 